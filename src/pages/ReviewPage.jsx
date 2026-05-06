import { useState, useEffect } from 'react'
import { getDueCards, updateCardSM2, deleteCard } from '../lib/storage'
import { updateSM2 } from '../lib/sm2'
import { exportToExcel } from '../lib/excelUtils'

export default function ReviewPage({ navigate }) {
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })

  useEffect(() => {
    const due = getDueCards().sort(() => Math.random() - 0.5)
    setCards(due)
  }, [])

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">🎉</div>
        <p className="text-xl font-bold text-gray-700">今天沒有待複習的題目</p>
        <p className="text-gray-500 text-sm">繼續答題累積錯題，間隔複習幫你長期記住！</p>
        <button
          onClick={() => navigate('setup')}
          className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
        >
          去答題
        </button>
        <br />
        <button onClick={() => navigate('dashboard')} className="text-gray-400 text-sm hover:underline">
          回首頁
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">✅</div>
        <p className="text-xl font-bold text-gray-700">今日複習完成！</p>
        <p className="text-gray-500">
          答對 <span className="text-green-600 font-bold">{stats.correct}</span> 題・
          答錯 <span className="text-red-500 font-bold">{stats.wrong}</span> 題
        </p>
        <p className="text-xs text-gray-400">系統已根據你的表現更新下次複習時間</p>
        <div className="space-y-3 mt-4">
          <button
            onClick={() => navigate('setup')}
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
          >
            繼續答題
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

  const q = cards[current]

  const confirm = () => {
    if (!selected) return
    setConfirmed(true)
  }

  const rateAndNext = (quality) => {
    // quality: 1=不熟(重複), 3=普通, 5=很熟
    const sm2 = updateSM2(q, quality)
    updateCardSM2(q.id, sm2)

    setStats(prev => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      wrong:   prev.wrong   + (quality < 3  ? 1 : 0),
    }))

    if (current + 1 < cards.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    } else {
      setDone(true)
    }
  }

  const handleDelete = () => {
    if (window.confirm('確定從複習清單移除這題？')) {
      deleteCard(q.id)
      const newCards = cards.filter(c => c.id !== q.id)
      if (newCards.length === 0) { setDone(true); return }
      setCards(newCards)
      setCurrent(Math.min(current, newCards.length - 1))
      setSelected(null)
      setConfirmed(false)
    }
  }

  const optionStyle = (key) => {
    const base = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm '
    if (!confirmed) {
      return base + (selected === key
        ? 'border-orange-400 bg-orange-50 text-orange-700'
        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300')
    }
    if (key === q.answer) return base + 'border-green-500 bg-green-50 text-green-700'
    if (key === selected) return base + 'border-red-400 bg-red-50 text-red-600'
    return base + 'border-gray-100 bg-gray-50 text-gray-400'
  }

  const intervalLabel = (interval) => {
    if (interval >= 30) return `${Math.round(interval/30)} 個月後`
    if (interval >= 7)  return `${Math.round(interval/7)} 週後`
    return `${interval} 天後`
  }

  return (
    <div className="space-y-4">
      {/* 標題列 */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          🔁 複習模式
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-normal">
            SM-2 間隔複習
          </span>
        </h2>
        <span className="text-sm text-gray-400">{current + 1} / {cards.length}</span>
      </div>

      {/* 進度列 */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 bg-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${(current / cards.length) * 100}%` }}
        />
      </div>

      {/* 題目 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="font-medium text-gray-800 leading-relaxed">{q.question}</p>
        <div className="mt-3 flex items-center justify-between">
          {q.fileName && (
            <span className="text-xs text-gray-400">來源：{q.fileName}</span>
          )}
          <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
            已複習 {q.repetitions ?? 0} 次
          </span>
        </div>
      </div>

      {/* 選項 */}
      {q.options && q.options.length > 0 && (
        <div className="space-y-2">
          {q.options.map(opt => (
            <button
              key={opt.key}
              disabled={confirmed}
              onClick={() => setSelected(opt.key)}
              className={optionStyle(opt.key)}
            >
              <span className="font-bold mr-2">{opt.key}.</span>{opt.text}
            </button>
          ))}
        </div>
      )}

      {/* 解析 */}
      {confirmed && q.explanation && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
          <span className="font-semibold">📌 解析：</span>{q.explanation}
        </div>
      )}

      {/* 結果 + 難度按鈕 */}
      {confirmed ? (
        <div className="space-y-3">
          <div className={`text-center py-2 rounded-xl text-sm font-semibold ${
            selected === q.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {selected === q.answer ? '✓ 答對了！' : `✗ 正確答案是 ${q.answer}`}
          </div>
          <p className="text-center text-xs text-gray-500">這題對你的難度如何？</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => rateAndNext(1)}
              className="py-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition"
            >
              😰 不熟<br />
              <span className="text-gray-400 font-normal">明天再複習</span>
            </button>
            <button
              onClick={() => rateAndNext(3)}
              className="py-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-semibold hover:bg-yellow-100 transition"
            >
              😊 普通<br />
              <span className="text-gray-400 font-normal">{intervalLabel((q.interval ?? 1) + 1)} 後</span>
            </button>
            <button
              onClick={() => rateAndNext(5)}
              className="py-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 transition"
            >
              😎 很熟<br />
              <span className="text-gray-400 font-normal">更久後</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={confirm}
          disabled={!selected}
          className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 disabled:opacity-40 transition shadow"
        >
          確認答案
        </button>
      )}

      {/* 刪除按鈕 */}
      <button
        onClick={handleDelete}
        className="w-full text-xs text-gray-300 hover:text-red-400 transition"
      >
        從複習清單移除此題
      </button>
    </div>
  )
}
