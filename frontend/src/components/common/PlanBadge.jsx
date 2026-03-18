const STATUS_CONFIG = {
  høring: { label: 'På høring', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  oppstart: { label: 'Oppstart', className: 'bg-blue-100 text-blue-800 border border-blue-300' },
  vedtatt: { label: 'Vedtatt', className: 'bg-green-100 text-green-800 border border-green-300' },
  avsluttet: { label: 'Avsluttet', className: 'bg-gray-100 text-gray-700 border border-gray-300' },
}

export default function PlanBadge({ status, frist }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.avsluttet

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
      {frist && status === 'høring' && (
        <span className="text-sm text-gray-600">
          Høringsfrist: <strong>{new Date(frist).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        </span>
      )}
    </div>
  )
}
