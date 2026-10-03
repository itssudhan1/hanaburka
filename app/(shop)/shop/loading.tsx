export default function ShopLoading() {
  return (
    <>
      {/* Navbar isn't in a shared layout — this page renders its own, so
          the fallback needs a matching placeholder or it flashes away
          during loading then pops back in. */}
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-[220px_1fr] gap-10">
      <div className="space-y-6">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-10" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10" />
      </div>
      <div>
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[3/4] mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
