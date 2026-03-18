import { Link } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan'
import PlanBadge from '../components/common/PlanBadge'
import DemoBanner from '../components/common/DemoBanner'
import SkeletonCard from '../components/common/SkeletonCard'

function Countdown({ frist }) {
  const now = new Date()
  const deadline = new Date(frist)
  const diffMs = deadline - now
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  if (diffDays === 0) return <span className="text-red-600 font-semibold">Fristen er i dag!</span>
  if (diffDays < 0) return <span className="text-gray-500">Fristen er passert</span>
  return (
    <span className="text-orange-700 font-semibold">
      {diffDays} {diffDays === 1 ? 'dag' : 'dager'} igjen
    </span>
  )
}

const FEATURE_CARDS = [
  {
    icon: '📋',
    title: 'Hva er planlagt?',
    desc: 'Forstå hva planforslaget faktisk innebærer for Nyhavna og nabolaget ditt.',
    to: '/plan',
    cta: 'Les planen',
  },
  {
    icon: '💬',
    title: 'Spør om planen',
    desc: 'Still spørsmål til vår AI-assistent som kan forklare planfaglige begreper på vanlig norsk.',
    to: '/plan',
    cta: 'Start chat',
  },
  {
    icon: '✍️',
    title: 'Si din mening',
    desc: 'Få hjelp til å formulere en høringmerknad som kommunen faktisk kan behandle.',
    to: '/merknad',
    cta: 'Skriv merknad',
  },
]

export default function Forside() {
  const { plan, loading, error } = usePlan()

  return (
    <div>
      {plan?.usingMockData && <DemoBanner />}

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Nyhavna, Trondheim
          </h1>
          <p className="text-blue-200 text-xl mb-6">Din stemme teller</p>

          {loading ? (
            <div className="inline-block bg-white/10 rounded-xl px-6 py-4">
              <div className="animate-pulse h-4 bg-white/20 rounded w-48 mb-2" />
              <div className="animate-pulse h-3 bg-white/10 rounded w-32" />
            </div>
          ) : error ? (
            <p className="text-blue-200 text-sm">{error}</p>
          ) : plan ? (
            <div className="inline-block bg-white/10 backdrop-blur rounded-xl px-6 py-4 text-left">
              <p className="font-semibold text-lg mb-1">{plan.plannavn}</p>
              <div className="flex flex-wrap items-center gap-3">
                <PlanBadge status={plan.status} frist={plan.hoeringsfrist} />
                {plan.status === 'høring' && (
                  <span className="text-blue-200 text-sm">
                    <Countdown frist={plan.hoeringsfrist} />
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/plan"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Forstå planen
            </Link>
            <Link
              to="/merknad"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Send merknad
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3" aria-hidden="true">{card.icon}</div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">{card.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{card.desc}</p>
              <Link
                to={card.to}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                {card.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Om medvirkning */}
      <section className="bg-blue-50 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Hva er medvirkning?</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Alle har rett til å komme med innspill når kommunen planlegger i ditt nabolag.
            Kommunen er lovpålagt å vurdere og svare på alle merknader.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Les planen', desc: 'Forstå hva kommunen ønsker å bygge og endre i området.' },
              { num: '2', title: 'Skriv merknad', desc: 'Fortell hva du mener er bra eller dårlig med planforslaget.' },
              { num: '3', title: 'Komunen svarer', desc: 'Kommunen er forpliktet til å behandle og besvare merknaden din.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
