import { useState } from 'react'
import { parseExcel } from '../lib/excelUtils'

export default function QuizSetup({ navigate }) {
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setError('') }
  }

  const start = async () => {
    if (!file) { setError('請先選擇 Excel 題庫檔案'); return }
    setLoading(true)
    setError('')
    try {
      const all = await parseExcel(file)
      if (all.length === 0) {
        setError('讀取不到題目，請確認 Excel 第一列有欄位名稱（題目、選項A…答案）')
        setLoading(false)
        return
      }
      const shuffled = [...all].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, Math.min(count, shuffled.length))
      navigate('quiz', { questions: selected, fileName: file.name, total: all.length })
    } catch (err) {
      setError('讀取失敗：' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('dashboard')} className="text-gray-400 hover:text-gray-600">←</button>
        <h2 className="text-xl font-bold text-gray-800">設定答題</h2>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
        {/* 選擇檔案 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            選擇 Excel 題庫檔案
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <span className="text-3xl mb-2">📂</span>
            <span className="text-blue-600 font-medium text-sm">
              {file ? file.name : '點擊選擇 .xlsx 檔案'}
            </span>
            {file && <span className="text-xs text-gray-400 mt-1">點擊可重新選擇</span>}
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {/* 選擇題數 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            出題數量：<span className="text-blue-600 font-bold text-lg">{count} 題</span>
          </label>
          <input
            type="range" min="5" max="50" step="5" value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {[5, 10, 20, 30, 40, 50].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </div>

      {/* Excel 格式說明 */}
      <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800 border border-amber-100">
        <p className="font-bold mb-2">📋 Excel 格式（第一列為欄位名稱）</p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-amber-100">
                {['NO','題目','答案','選項A','選項B','選項C','選項D','題目解析'].map(h => (
                  <th key={h} className="border border-amber-200 px-2 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-amber-200 px-2 py-1 text-gray-400">1</td>
                <td className="border border-amber-200 px-2 py-1">台灣最高的山？</td>
                <td className="border border-amber-200 px-2 py-1 font-bold text-green-700">A</td>
                <td className="border border-amber-200 px-2 py-1">玉山</td>
                <td className="border border-amber-200 px-2 py-1">雪山</td>
                <td className="border border-amber-200 px-2 py-1">合歡山</td>
                <td className="border border-amber-200 px-2 py-1">阿里山</td>
                <td className="border border-amber-200 px-2 py-1 text-gray-500">可空白</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-amber-600">答案欄填 A、B、C 或 D，題目解析可省略。NO 欄可有可無。</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
      )}

      <button
        onClick={start}
        disabled={loading || !file}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-40 active:scale-95 transition shadow"
      >
        {loading ? '讀取題庫中...' : '開始答題 →'}
      </button>
    </div>
  )
}
