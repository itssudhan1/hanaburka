export default function HomeLoading() {
  return (
    <div>
      {/* AnnouncementBar + Navbar aren't in a shared layout (they're
          rendered inside this page itself), so this fallback replaces
          them too — these placeholders match their real heights
          (h-8 / h-20 md:h-24) so nothing jumps once real content mounts. */}
      <div className="skeleton h-8 w-full" />
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>

      {/* Hero */}
      <div className="skeleton w-full h-[100svh] min-h-[560px]" />

      {/* Category grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="skeleton h-8 w-56 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[4/5] md:aspect-square mb-3" />
              <div className="skeleton h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Product rail */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
        <div className="skeleton h-8 w-40 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[3/4] mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
