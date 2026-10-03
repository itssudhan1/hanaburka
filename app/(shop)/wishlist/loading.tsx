export default function WishlistLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="skeleton h-8 w-44 mb-8" />
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
    </>
  );
}
