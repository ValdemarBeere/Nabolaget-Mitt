import { useState, useEffect } from 'react'
import api, { PLAN_ID } from '../api/apiClient'

// NYHAVNA-SPESIFIKT: ingen autentisering i prototype
export default function Admin() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [oppsummering, setOppsummering] = useState(null)
  const [oppLoading, setOppLoading] = useState(false)

  useEffect(() => {
    api.get(`/api/plan/${PLAN_ID}/admin`)
      .then((res) => setStats(res.data))
      .catch(() => setError('Kunne ikke hente statistikk.'))
      .finally(() => setLoading(false))
  }, [])

  async function lagOppsummering() {
    setOppLoading(true)
    try {
      const res = await api.post(`/api/plan/${PLAN_ID}/oppsummering`)
      setOppsummering(res.data.oppsummering)
    } catch {
      setOppsummering('Feil ved generering av oppsummering.')
    } finally {
      setOppLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">Laster...</div>
  )
  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center text-red-500">{error}</div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administrasjon — Merknadsoversikt</h1>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Ingen innlogging (prototype)</span>
      </div>

      {/* Statistikkrad */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{stats.totalt}</p>
          <p className="text-sm text-gray-500 mt-1">Totalt merknader</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{stats.temaGrupper.length}</p>
          <p className="text-sm text-gray-500 mt-1">Ulike temaer</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-blue-600">
            {stats.temaGrupper[0]?.tema || '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Mest bekymring om</p>
        </div>
      </div>

      {/* AI-oppsummering */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Tematisk AI-oppsummering</h2>
          <button
            onClick={lagOppsummering}
            disabled={oppLoading || stats.totalt === 0}
            className="text-sm px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {oppLoading ? 'Genererer...' : 'Generer med AI'}
          </button>
        </div>
        {oppsummering ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{oppsummering}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Trykk "Generer med AI" for å lage en tematisk oppsummering av alle merknader.
          </p>
        )}
      </div>

      {/* Tematiske grupper */}
      {stats.temaGrupper.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Ingen merknader mottatt ennå.</div>
      ) : (
        <div className="space-y-6">
          {stats.temaGrupper.map((gruppe) => (
            <div key={gruppe.tema} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">{gruppe.tema}</h2>
                <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-0.5 rounded-full">
                  {gruppe.antall}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {gruppe.merknader.slice(0, 5).map((m) => (
                  <li key={m.id} className="px-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{m.tekst}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(m.createdAt).toLocaleString('nb-NO')}
                    </p>
                  </li>
                ))}
                {gruppe.antall > 5 && (
                  <li className="px-6 py-3 text-sm text-gray-400 text-center">
                    + {gruppe.antall - 5} flere merknader
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
