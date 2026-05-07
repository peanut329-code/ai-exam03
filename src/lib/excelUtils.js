import * as XLSX from 'xlsx'

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        resolve(parseRows(rows))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function findCol(headers, aliases) {
  for (const alias of aliases) {
    const idx = headers.indexOf(alias.toLowerCase())
    if (idx !== -1) return idx
  }
  return -1
}

function parseRows(rows) {
  if (rows.length < 2) return []

  const headers = rows[0].map(h => String(h).trim().toLowerCase())

  const qIdx  = findCol(headers, ['題目', '問題', 'question', 'q'])
  const aIdx  = findCol(headers, ['選項a', 'a', '(a)', 'option a', 'optiona'])
  const bIdx  = findCol(headers, ['選項b', 'b', '(b)', 'option b', 'optionb'])
  const cIdx  = findCol(headers, ['選項c', 'c', '(c)', 'option c', 'optionc'])
  const dIdx  = findCol(headers, ['選項d', 'd', '(d)', 'option d', 'optiond'])
  const ansIdx = findCol(headers, ['答案', 'answer', 'ans', '正確答案'])
  const expIdx = findCol(headers, ['題目解析', '說明', '解析', '解說', 'explanation', 'exp'])

  if (qIdx === -1 || ansIdx === -1) return []

  const questions = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const questionText = String(row[qIdx] ?? '').trim()
    if (!questionText) continue

    const options = []
    if (aIdx !== -1 && row[aIdx]) options.push({ key: 'A', text: String(row[aIdx]) })
    if (bIdx !== -1 && row[bIdx]) options.push({ key: 'B', text: String(row[bIdx]) })
    if (cIdx !== -1 && row[cIdx]) options.push({ key: 'C', text: String(row[cIdx]) })
    if (dIdx !== -1 && row[dIdx]) options.push({ key: 'D', text: String(row[dIdx]) })

    questions.push({
      id: `q_${i}_${Date.now()}`,
      question: questionText,
      options,
      answer: String(row[ansIdx] ?? '').trim().toUpperCase(),
      explanation: expIdx !== -1 ? String(row[expIdx] ?? '').trim() : '',
    })
  }
  return questions
}

export function exportToExcel(questions, filename = '錯題清單.xlsx') {
  const data = questions.map((q, i) => ({
    '編號': i + 1,
    '題目': q.question,
    '選項A': q.options?.[0]?.text ?? '',
    '選項B': q.options?.[1]?.text ?? '',
    '選項C': q.options?.[2]?.text ?? '',
    '選項D': q.options?.[3]?.text ?? '',
    '正確答案': q.answer,
    '說明': q.explanation ?? '',
    '複習次數': q.repetitions ?? 0,
    '下次複習日': q.nextReview
      ? new Date(q.nextReview).toLocaleDateString('zh-TW')
      : '今天',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  // Auto column width
  const colWidths = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length * 2, 15) }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '錯題清單')
  XLSX.writeFile(wb, filename)
}
