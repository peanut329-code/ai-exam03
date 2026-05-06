import { useState } from 'react'

export default function QuizPage({ data, navigate }) {
  const { questions, fileName } = data
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [answers, setAnswers] = useState([])

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  const confirm = () => {
    if (!selected) return
    const isCorrect = selected === q.answer
    setConfirmed(true)
    setAnswers(prev => [...prev, { ...q, userAnswer: selected, correct: isCorrect }])
  }

  const next = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    } else {
      navigate('result', { answers: [...answers], fileName })
    }
  }

  const optionStyle = (key) => {
    const base = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm '
    if (!confirmed) {
      return base + (selected === key
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50')
    }
    if (key === q.answer) return base + 'border-green-500 bg-green-50 text-green-700'
    if (key === selected)  return base + 'border-red-400 bg-red-50 text-red-600'
    return base + 'border-gray-100 bg-gray-50 text-gray-400'
  }

  return (
    <div className="space-y-4">
      {/* 進度列 */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>第 {current + 1} 題 / 共 {questions.length} 題</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 題目 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="font-medium text-gray-800 leading-relaxed text-base">{q.question}</p>
      </div>

      {/* 選項 */}
      <div className="space-y-2">
        {q.options.map(opt => (
          <button
            key={opt.key}
            disabled={confirmed}
            onClick={() => setSelected(opt.key)}
            className={optionStyle(opt.key)}
          >
            <span className="font-bold mr-2 text-base">{opt.key}.</span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* 結果提示 */}
      {confirmed && (
        <div className={`text-center py-3 rounded-xl font-semibold text-sm ${
          selected === q.answer
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-600'
        }`}>
          {selected === q.answer
            ? '✓ 答對了！'
            : `✗ 答錯了，正確答案是 ${q.answer}`}
        </div>
      )}

      {/* 解析 */}
      {confirmed && q.explanation && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
          <span className="font-semibold text-gray-700">📌 解析：</span>
          {q.explanation}
        </div>
      )}

      {/* 按鈕 */}
      {!confirmed ? (
        <button
          onClick={confirm}
          disabled={!selected}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow"
        >
          確認答案
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition shadow"
        >
          {current + 1 < questions.length ? '下一題 →' : '查看結果 →'}
        </button>
      )}
    </div>
  )
}
