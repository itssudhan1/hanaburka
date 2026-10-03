export default function CartLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-[1fr_320px] gap-12">
          <div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-6 border-b border-mocha/15">
                <div className="skeleton w-20 h-24 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="skeleton h-4 w-2/3 mb-2" />
                  <div className="skeleton h-3 w-1/3 mb-3" />
                  <div className="skeleton h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="border border-mocha/15 p-6 h-fit">
            <div className="skeleton h-4 w-full mb-4" />
            <div className="skeleton h-11 w-full mb-4" />
            <div className="skeleton h-4 w-2/3 mx-auto" />
          </div>
        </div>
      </div>
    </>
  );
}
