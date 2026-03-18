export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <p className="text-center text-sm text-amber-800">
        <strong>Demo-modus:</strong> Plandata er eksempeldata. Last opp PDF-filer til{' '}
        <code className="bg-amber-100 px-1 rounded text-xs">
          backend/src/main/resources/plandata/nyhavna/
        </code>{' '}
        for full funksjonalitet.
      </p>
    </div>
  )
}
