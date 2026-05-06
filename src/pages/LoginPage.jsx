import { useState } from 'react'

const CORRECT_PASSWORD = '0000'
const USERNAME_KEY = 'quiz_username'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = username.trim()
    if (!name) { setError('請輸入你的姓名'); return }
    if (password !== CORRECT_PASSWORD) { setError('密碼錯誤'); return }
    localStorage.setItem(USERNAME_KEY, name)
    onLogin(name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo 區 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-gray-800">刷題練習系統</h1>
          <p className="text-gray-500 text-sm mt-1">間隔複習，輕鬆記住知識</p>
        </div>

        {/* 登入表單 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="請輸入你的姓名"
              autoComplete="name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="請輸入密碼"
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 active:scale-95 transition shadow"
          >
            進入系統
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          姓名用於記錄你的學習進度
        </p>
      </div>
    </div>
  )
}

export function getSavedUsername() {
  return localStorage.getItem(USERNAME_KEY)
}
