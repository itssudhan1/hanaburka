export default function CollectionsLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="skeleton h-8 w-40 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[4/5] md:aspect-square mb-3" />
              <div className="skeleton h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
