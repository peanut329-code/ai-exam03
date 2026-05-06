import { useEffect, useState } from 'react'
import { getStats, syncFromSupabase } from '../lib/storage'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Dashboard({ navigate, username }) {
  const [stats, setStats] = useState({ total: 0, dueToday: 0, mastered: 0 })
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    setStats(getStats())
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    const count = await syncFromSupabase()
    if (count !== null) {
      setStats(getStats())
      setSyncMsg(`✓ 從雲端同步了 ${count} 筆錯題`)
    } else {
      setSyncMsg('⚠ 同步失敗，請確認 Supabase 設定')
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-gray-800">{username}，今天繼續練習吧！</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="錯題總數" value={stats.total} color="blue" icon="📝" />
        <StatCard label="今日待複習" value={stats.dueToday} color="orange" icon="🔁" />
        <StatCard label="已掌握" value={stats.mastered} color="green" icon="✅" />
      </div>

      {/* 主要按鈕 */}
      <div className="space-y-3">
        {stats.dueToday > 0 && (
          <button
            onClick={() => navigate('review')}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-semibold text-lg hover:bg-orange-600 active:scale-95 transition shadow"
          >
            🔁 開始今日複習（{stats.dueToday} 題待複習）
          </button>
        )}
        <button
          onClick={() => navigate('setup')}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 active:scale-95 transition shadow"
        >
          📁 上傳題庫，開始答題
        </button>
      </div>

      {/* Supabase 同步 */}
      {isSupabaseConfigured() && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 text-sm">雲端同步</p>
              <p className="text-xs text-gray-400">my-teaching-tools (Supabase)</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 disabled:opacity-50 transition"
            >
              {syncing ? '同步中...' : '從雲端拉取'}
            </button>
          </div>
          {syncMsg && <p className="mt-2 text-xs text-gray-500">{syncMsg}</p>}
        </div>
      )}

      {/* 新手說明 */}
      {stats.total === 0 && (
        <div className="bg-blue-50 rounded-2xl p-5 text-blue-800">
          <p className="font-bold mb-2">📖 如何使用？</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>準備含題目、選項、答案的 Excel 檔案</li>
            <li>點擊「上傳題庫，開始答題」</li>
            <li>答題後系統自動記錄錯題到雲端</li>
            <li>隔天回來，系統提醒你複習到期的錯題</li>
            <li>間隔複習讓你用最少時間記住最多題目！</li>
          </ol>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-600',
    green:  'bg-green-50 text-green-700',
  }
  return (
    <div className={`rounded-2xl p-4 text-center ${colors[color]} shadow-sm`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs mt-1 font-medium">{label}</div>
    </div>
  )
}
