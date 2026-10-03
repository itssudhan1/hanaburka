export default function ProductLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
      <div className="skeleton aspect-[4/5]" />
      <div>
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-9 w-2/3 mb-6" />
        <div className="skeleton h-7 w-24 mb-8" />
        <div className="skeleton h-4 w-16 mb-2" />
        <div className="flex gap-2 mb-6">
          <div className="skeleton h-9 w-16" />
          <div className="skeleton h-9 w-16" />
        </div>
        <div className="skeleton h-12" />
      </div>
      </div>
    </>
  );
}
