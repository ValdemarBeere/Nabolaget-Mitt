const TEMAER = [
  'Sol og skygge',
  'Trafikk og parkering',
  'Byggehøyde',
  'Grøntareal',
  'Innsyn og privatliv',
  'Støy',
  'Annet',
]

export default function ThemeSelector({ selected, onChange }) {
  function toggle(tema) {
    if (selected.includes(tema)) {
      onChange(selected.filter((t) => t !== tema))
    } else {
      onChange([...selected, tema])
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {TEMAER.map((tema) => {
        const isSelected = selected.includes(tema)
        return (
          <button
            key={tema}
            type="button"
            onClick={() => toggle(tema)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
            aria-pressed={isSelected}
          >
            {tema}
          </button>
        )
      })}
    </div>
  )
}
