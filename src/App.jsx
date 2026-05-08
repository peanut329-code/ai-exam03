import { useState } from 'react'
import LoginPage, { getSavedUsername } from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import QuizSetup from './pages/QuizSetup'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  const [username, setUsername] = useState(() => getSavedUsername())
  const [page, setPage]         = useState('dashboard')
  const [quizData, setQuizData] = useState(null)
  const [resultData, setResultData] = useState(null)

  const navigate = (target, data = null) => {
    if (target === 'quiz')   setQuizData(data)
    if (target === 'result') setResultData(data)
    setPage(target)
    window.scrollTo(0, 0)
  }

  const handleLogin = (name) => {
    setUsername(name)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('quiz_username')
    setUsername(null)
    setPage('dashboard')
  }

  // 未登入 → 顯示登入頁
  if (!username) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="text-lg font-bold hover:opacity-80 transition"
          >
            📚 刷題練習系統
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-100">
              👤 {username}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-blue-200 hover:text-white transition"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {page === 'dashboard' && <Dashboard navigate={navigate} username={username} />}
        {page === 'setup'     && <QuizSetup navigate={navigate} />}
        {page === 'quiz'      && quizData   && <QuizPage   data={quizData}   navigate={navigate} />}
        {page === 'result'    && resultData && <ResultPage data={resultData} navigate={navigate} />}
        {page === 'review'    && <ReviewPage navigate={navigate} />}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Designed &amp; Developed by Lingo｜2026
      </footer>
    </div>
  )
}
