import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">🗺️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Siden ble ikke funnet</h1>
      <p className="text-gray-600 mb-8">
        Adressen du lette etter finnes ikke. Kanskje du lette etter Nyhavna-planen?
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Gå til forsiden
        </Link>
        <Link
          to="/plan"
          className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Se Nyhavna-planen
        </Link>
      </div>
    </div>
  )
}
