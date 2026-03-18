import { Link } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan'
import PlanBadge from '../components/common/PlanBadge'
import DemoBanner from '../components/common/DemoBanner'
import SkeletonCard from '../components/common/SkeletonCard'
import Chatbot from '../components/chat/Chatbot'

function NokkelTallKort({ label, verdi }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-blue-700">{verdi}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  )
}

export default function PlanDetalj() {
  const { plan, loading, error } = usePlan()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={3} />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">{error || 'Planen ble ikke funnet.'}</p>
        <a
          href="https://www.arealplaner.no"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Søk direkte på arealplaner.no →
        </a>
      </div>
    )
  }

  return (
    <div>
      {plan.usingMockData && <DemoBanner />}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

          {/* Venstre spalte */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{plan.plannavn}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.kommune} · {plan.plantype} · Plan-ID: {plan.planId}
                  </p>
                </div>
                <PlanBadge status={plan.status} frist={plan.hoeringsfrist} />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <h2 className="text-sm font-semibold text-blue-800 mb-2">AI-oppsummering</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{plan.aiSammendrag}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NokkelTallKort label="Maks etasjer" verdi={plan.nokkelTall?.maksEtasjer} />
                <NokkelTallKort label="Utnyttelsesgrad" verdi={plan.nokkelTall?.utnyttelsesgrad} />
                <NokkelTallKort label="Planområde" verdi={plan.nokkelTall?.areal} />
                <NokkelTallKort label="Plantype" verdi={plan.nokkelTall?.plantype} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Plandokumenter</h2>
              <ul className="space-y-2">
                {plan.dokumenter?.map((dok) => (
                  <li key={dok.navn}>
                    <a
                      href={dok.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <span aria-hidden="true">📄</span>
                      {dok.navn}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={plan.kommunensHoeringsskjema}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Les originaldokumentet på arealplaner.no →
                </a>
              </div>
            </div>

            <Link
              to="/merknad"
              className="block w-full bg-blue-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Send merknad til kommunen
            </Link>
          </div>

          {/* Høyre spalte — Chatbot */}
          <div className="h-[600px] lg:sticky lg:top-20">
            <Chatbot plannavn={plan.plannavn} />
          </div>
        </div>
      </div>
    </div>
  )
}
