import { useEffect, useState } from 'react'
import { addWrongAnswers } from '../lib/storage'
import { exportToExcel } from '../lib/excelUtils'

export default function ResultPage({ data, navigate }) {
  const { answers, fileName } = data
  const correct = answers.filter(a => a.correct)
  const wrong   = answers.filter(a => !a.correct)
  const score   = Math.round((correct.length / answers.length) * 100)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    if (wrong.length > 0) {
      const result = addWrongAnswers(wrong, fileName)
      setSaved(result)
    }
  }, [])

  const grade = score >= 90 ? { label: '優秀', color: 'text-green-600', bg: 'bg-green-50' }
              : score >= 70 ? { label: '良好', color: 'text-blue-600', bg: 'bg-blue-50' }
              : score >= 60 ? { label: '及格', color: 'text-yellow-600', bg: 'bg-yellow-50' }
              :               { label: '需加油', color: 'text-red-500', bg: 'bg-red-50' }

  return (
    <div className="space-y-5">
      {/* 成績卡 */}
      <div className={`${grade.bg} rounded-2xl p-6 text-center shadow-sm`}>
        <div className={`text-6xl font-bold ${grade.color}`}>{score}<span className="text-3xl">分</span></div>
        <div className={`text-lg font-semibold mt-1 ${grade.color}`}>{grade.label}</div>
        <p className="text-gray-500 text-sm mt-2">
          答對 {correct.length} 題・答錯 {wrong.length} 題・共 {answers.length} 題
        </p>
        {wrong.length > 0 && saved && (
          <p className="mt-2 text-orange-600 text-sm font-medium">
            📌 已新增 {saved.added} 題錯題到複習清單（累計 {saved.total} 題）
          </p>
        )}
        {wrong.length === 0 && (
          <p className="mt-2 text-green-600 text-sm font-medium">🎉 全部答對，太厲害了！</p>
        )}
      </div>

      {/* 答題明細 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-700">答題明細</h3>
          {wrong.length > 0 && (
            <button
              onClick={() => exportToExcel(wrong, `錯題_${fileName}`)}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              匯出錯題 Excel ↓
            </button>
          )}
        </div>

        {answers.map((a, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 text-sm border ${
              a.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`text-base ${a.correct ? 'text-green-500' : 'text-red-400'}`}>
                {a.correct ? '✓' : '✗'}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{i + 1}. {a.question}</p>
                {!a.correct && (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-red-500">你的答案：{a.userAnswer}. {a.options.find(o => o.key === a.userAnswer)?.text}</p>
                    <p className="text-green-700">正確答案：{a.answer}. {a.options.find(o => o.key === a.answer)?.text}</p>
                  </div>
                )}
                {a.explanation && (
                  <p className="mt-1 text-gray-500 text-xs">📌 {a.explanation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 操作按鈕 */}
      <div className="space-y-3 pb-4">
        {wrong.length > 0 && (
          <button
            onClick={() => navigate('review')}
            className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition shadow"
          >
            🔁 立即複習錯題
          </button>
        )}
        <button
          onClick={() => navigate('setup')}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow"
        >
          再次答題
        </button>
        <button
          onClick={() => navigate('dashboard')}
          className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold hover:bg-gray-200 transition"
        >
          回首頁
        </button>
      </div>
    </div>
  )
}
