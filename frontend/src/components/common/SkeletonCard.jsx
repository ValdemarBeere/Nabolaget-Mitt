export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-3 p-4 bg-white rounded-xl border border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded w-full" />
      ))}
    </div>
  )
}
