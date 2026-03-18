import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Forside from './pages/Forside'
import PlanDetalj from './pages/PlanDetalj'
import Merknad from './pages/Merknad'
import Admin from './pages/Admin'
import Om from './pages/Om'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Forside />} />
            <Route path="/plan" element={<PlanDetalj />} />
            <Route path="/merknad" element={<Merknad />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/om" element={<Om />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
