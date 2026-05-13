import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage'
import AnalyzerPage from './features/analysis/AnalyzerPage'
import QuizPage from './features/quiz/QuizPage'
import TipsPage from './features/tips/TipsPage'
import TipDetailPage from './features/tips/TipDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />}       />
        <Route path="/analyzer" element={<AnalyzerPage />}   />
        <Route path="/tryon"    element={<QuizPage />}       />
        <Route path="/tips"     element={<TipsPage />}       />
        <Route path="/tips/:id" element={<TipDetailPage />}  />
        <Route path="*"         element={<NotFoundPage />}   />
      </Routes>
    </BrowserRouter>
  )
}
