import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage'
import AnalyzerPage from './features/analysis/AnalyzerPage'
import QuizPage from './features/quiz/QuizPage'
import AdvisorPage from './features/advisor/AdvisorPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />}       />
        <Route path="/analyzer" element={<AnalyzerPage />}   />
        <Route path="/tryon"    element={<QuizPage />}       />
<Route path="/advisor"  element={<AdvisorPage />}    />
        <Route path="*"         element={<NotFoundPage />}   />
      </Routes>
    </BrowserRouter>
  )
}
