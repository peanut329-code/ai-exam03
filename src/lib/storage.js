// 混合儲存：localStorage（離線）+ Supabase（雲端同步）
import { supabase, isSupabaseConfigured } from './supabase'

const USERNAME_KEY = 'quiz_username'

// 以使用者姓名為識別，每個學生有獨立的記錄 key
function getStorageKey() {
  const name = localStorage.getItem(USERNAME_KEY) || 'guest'
  return `quiz_wrong_answers_${name}`
}

export function getUserId() {
  return localStorage.getItem(USERNAME_KEY) || 'guest'
}

export function getWrongAnswers() {
  try {
    const data = localStorage.getItem(getStorageKey())
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocal(questions) {
  localStorage.setItem(getStorageKey(), JSON.stringify(questions))
}

export function addWrongAnswers(newQuestions, fileName) {
  const existing = getWrongAnswers()
  const existingMap = new Map(existing.map(q => [q.question, q]))

  const toAdd = []
  for (const q of newQuestions) {
    if (!existingMap.has(q.question)) {
      toAdd.push({
        ...q,
        fileName,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      })
    }
  }

  const all = [...existing, ...toAdd]
  saveLocal(all)

  // 同步到 Supabase
  if (isSupabaseConfigured() && toAdd.length > 0) {
    syncManyToSupabase(toAdd).catch(console.warn)
  }

  return { added: toAdd.length, total: all.length }
}

export function updateCardSM2(questionId, sm2Data) {
  const all = getWrongAnswers()
  const updated = all.map(q =>
    q.id === questionId ? { ...q, ...sm2Data } : q
  )
  saveLocal(updated)

  if (isSupabaseConfigured()) {
    const card = updated.find(q => q.id === questionId)
    if (card) syncCardToSupabase(card).catch(console.warn)
  }
}

export function getDueCards() {
  const all = getWrongAnswers()
  const now = new Date()
  return all.filter(q => !q.nextReview || new Date(q.nextReview) <= now)
}

export function getStats() {
  const all = getWrongAnswers()
  const due = getDueCards()
  const mastered = all.filter(q => q.repetitions >= 3 && q.interval >= 21)
  return {
    total: all.length,
    dueToday: due.length,
    mastered: mastered.length,
  }
}

export function deleteCard(questionId) {
  const all = getWrongAnswers()
  const updated = all.filter(q => q.id !== questionId)
  saveLocal(updated)
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function toRow(card) {
  const userId = getUserId()
  return {
    id: `${userId}_${card.id}`,
    user_id: userId,
    question_id: card.id,
    question: card.question,
    options: card.options,
    answer: card.answer,
    explanation: card.explanation || '',
    file_name: card.fileName || '',
    repetitions: card.repetitions ?? 0,
    ease_factor: card.easeFactor ?? 2.5,
    interval_days: card.interval ?? 1,
    next_review: card.nextReview,
    added_at: card.addedAt,
  }
}

async function syncCardToSupabase(card) {
  if (!supabase) return
  await supabase.from('wrong_answers').upsert(toRow(card))
}

async function syncManyToSupabase(cards) {
  if (!supabase) return
  await supabase.from('wrong_answers').upsert(cards.map(toRow))
}

export async function syncFromSupabase() {
  if (!supabase) return null
  try {
    const userId = getUserId()
    const { data, error } = await supabase
      .from('wrong_answers')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    if (!data || data.length === 0) return null

    const questions = data.map(row => ({
      id: row.question_id,
      question: row.question,
      options: row.options,
      answer: row.answer,
      explanation: row.explanation,
      fileName: row.file_name,
      repetitions: row.repetitions,
      easeFactor: row.ease_factor,
      interval: row.interval_days,
      nextReview: row.next_review,
      addedAt: row.added_at,
    }))

    // 合併：以 Supabase 為主，保留本機有但雲端沒有的
    const local = getWrongAnswers()
    const cloudIds = new Set(questions.map(q => q.id))
    const localOnly = local.filter(q => !cloudIds.has(q.id))
    saveLocal([...questions, ...localOnly])
    return questions.length
  } catch (err) {
    console.warn('Supabase sync failed:', err)
    return null
  }
}
