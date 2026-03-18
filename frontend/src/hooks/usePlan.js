import { useState, useEffect } from 'react'
import api from '../api/apiClient'

export function usePlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/plan')
      .then((res) => setPlan(res.data))
      .catch((err) => setError('Kunne ikke hente plandata. Prøv igjen senere.'))
      .finally(() => setLoading(false))
  }, [])

  return { plan, loading, error }
}
