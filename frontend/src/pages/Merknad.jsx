import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { PLAN_ID } from '../api/apiClient'
import ThemeSelector from '../components/merknad/ThemeSelector'
import MerknadEditor from '../components/merknad/MerknadEditor'
import AIHelper from '../components/merknad/AIHelper'

const STEPS = ['Velg tema', 'Beskriv bekymringen', 'Ferdig merknad', 'Kvittering']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            i + 1 < current ? 'bg-green-500 text-white' :
            i + 1 === current ? 'bg-blue-600 text-white' :
            'bg-gray-200 text-gray-500'
          }`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={`text-sm hidden sm:inline ${i + 1 === current ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-300 flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}

export default function Merknad() {
  const [step, setStep] = useState(1)
  const [temaer, setTemaer] = useState([])
  const [fritekst, setFritekst] = useState('')
  const [merknadTekst, setMerknadTekst] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [email, setEmail] = useState('')
  const [lagreLoading, setLagreLoading] = useState(false)
  const [lagretId, setLagretId] = useState(null)
  const [copied, setCopied] = useState(false)

  async function genererUtkast() {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await api.post('/api/merknad/generer', {
        planId: PLAN_ID,
        temaer,
        fritekst,
      })
      setMerknadTekst(res.data.utkast)
      setStep(3)
    } catch {
      setAiError('Kunne ikke generere utkast. Fortsett med å skrive manuelt.')
      setStep(3)
      setMerknadTekst(lageManuellMerknad(temaer, fritekst))
    } finally {
      setAiLoading(false)
    }
  }

  async function lagreMerknad() {
    setLagreLoading(true)
    try {
      const res = await api.post('/api/merknad/lagre', {
        planId: PLAN_ID,
        tekst: merknadTekst,
        email: email || null,
        temaer,
      })
      setLagretId(res.data.id)
      setStep(4)
    } catch {
      alert('Noe gikk galt. Prøv igjen.')
    } finally {
      setLagreLoading(false)
    }
  }

  function kopierMerknad() {
    navigator.clipboard.writeText(merknadTekst)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function lageManuellMerknad(temaer, fritekst) {
    return `Til Trondheim kommune

Jeg ønsker å sende inn en merknad til Områderegulering for Nyhavna (planId: ${PLAN_ID}).

Mine bekymringer gjelder: ${temaer.join(', ')}.

${fritekst}

Jeg ber kommunen vurdere disse hensynene i den videre planbehandlingen.

Med vennlig hilsen
[Ditt navn]
[Din adresse]`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepIndicator current={step} />

      {/* Steg 1 */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hva er du bekymret for?</h1>
          <p className="text-gray-600 mb-6">Velg ett eller flere temaer som gjelder deg.</p>
          <ThemeSelector selected={temaer} onChange={setTemaer} />
          <button
            onClick={() => setStep(2)}
            disabled={temaer.length === 0}
            className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Fortsett →
          </button>
        </div>
      )}

      {/* Steg 2 */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Beskriv bekymringen</h1>
          <p className="text-gray-600 mb-1">Skriv hva du er bekymret for med egne ord.</p>
          <p className="text-sm text-gray-400 mb-4">Du trenger ikke bruke fagtermer. Skriv hva du tenker.</p>
          <textarea
            value={fritekst}
            onChange={(e) => setFritekst(e.target.value)}
            rows={6}
            placeholder="For eksempel: Jeg er bekymret for at de høye byggene vil skygge for hagen min store deler av dagen..."
            className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
          {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <AIHelper
              onClick={genererUtkast}
              loading={aiLoading}
              disabled={fritekst.trim().length < 10}
            />
            <button
              onClick={() => { setMerknadTekst(lageManuellMerknad(temaer, fritekst)); setStep(3) }}
              disabled={fritekst.trim().length < 10}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Skriv manuelt
            </button>
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
            ← Tilbake
          </button>
        </div>
      )}

      {/* Steg 3 */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ferdig merknad</h1>
          <p className="text-gray-600 mb-4">Du kan redigere teksten fritt før du sender.</p>
          <MerknadEditor value={merknadTekst} onChange={setMerknadTekst} />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={kopierMerknad}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copied ? '✓ Kopiert!' : '📋 Kopier merknad'}
            </button>
            <a
              href="https://innsyn.trondheim.kommune.no/hoering/nyhavna-2024"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Send direkte til kommunen ↗
            </a>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Vil du lagre og følge merknaden din?</h2>
            <p className="text-sm text-gray-600 mb-3">
              Vi sender deg en e-post når kommunen har behandlet høringen.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-postadresse (valgfritt)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            />
            <button
              onClick={lagreMerknad}
              disabled={lagreLoading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {lagreLoading ? 'Lagrer...' : 'Lagre og motta bekreftelse'}
            </button>
          </div>
          <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
            ← Tilbake
          </button>
        </div>
      )}

      {/* Steg 4 — Kvittering */}
      {step === 4 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4" aria-hidden="true">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Din merknad er lagret</h1>
          {email && (
            <p className="text-gray-600 mb-6">
              Vi sender en bekreftelse til <strong>{email}</strong>.
            </p>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Hva skjer videre?</h2>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> Høringen avsluttes 30. april 2025.</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> Kommunen samler alle merknader og lager et sammendrag.</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> Kommunen er forpliktet til å vurdere og svare på alle merknader.</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> Planen behandles politisk i bystyret.</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">5.</span> Etter vedtak kan planen klages inn til Statsforvalteren.</li>
            </ol>
          </div>

          <Link
            to="/plan"
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Gå tilbake til planen
          </Link>
        </div>
      )}
    </div>
  )
}
