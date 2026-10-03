export default function CheckoutLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="skeleton h-8 w-40 mb-8" />
        <div className="grid md:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-4">
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="skeleton h-11 w-full" />
              <div className="skeleton h-11 w-full" />
            </div>
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
          <div className="border border-mocha/15 p-6 h-fit space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-px w-full my-2" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-11 w-full mt-4" />
          </div>
        </div>
      </div>
    </>
  );
}
