export default function MerknadEditor({ value, onChange, readOnly = false }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      rows={10}
      className="w-full border border-gray-300 rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y font-mono"
      aria-label="Merknadstekst"
    />
  )
}
