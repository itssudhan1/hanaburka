export default function DashboardLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-mocha/15 p-5 bg-white">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="skeleton h-6 w-36 mb-3" />
      <div className="border border-mocha/15 bg-white p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-5 w-full" />
        ))}
      </div>
    </div>
  );
}
