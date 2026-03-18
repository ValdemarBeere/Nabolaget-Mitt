import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">NaboPlan</h3>
            <p className="text-sm">
              AI-støttet medvirkning i norsk byplanlegging.
              Et prosjekt fra NTNU EiT TDT4857.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Lenker</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Hjem</Link></li>
              <li><Link to="/plan" className="hover:text-white transition-colors">Nyhavna-planen</Link></li>
              <li><Link to="/merknad" className="hover:text-white transition-colors">Send merknad</Link></li>
              <li><Link to="/om" className="hover:text-white transition-colors">Om tjenesten</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Personvern</h3>
            <p className="text-sm">
              E-postadresser lagres kun for varsling og merknadbekreftelse.
              Ingen annen persondata samles inn.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
          © 2025 NaboPlan — NTNU EiT TDT4857
        </div>
      </div>
    </footer>
  )
}
