// SM-2 間隔複習演算法（Anki 同款）
// quality: 0=完全不記得, 1=很難, 3=普通答對, 5=輕鬆答對
export function updateSM2(card, quality) {
  let { repetitions = 0, easeFactor = 2.5, interval = 1 } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    nextReview: nextReview.toISOString(),
  }
}

export function isDue(card) {
  if (!card.nextReview) return true
  return new Date(card.nextReview) <= new Date()
}
