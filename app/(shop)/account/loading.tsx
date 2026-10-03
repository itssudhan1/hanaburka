export default function AccountLoading() {
  return (
    <>
      <div className="h-20 md:h-24 flex items-center px-6">
        <div className="skeleton h-7 md:h-9 w-32" />
      </div>
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-40 mb-10" />
        <div className="space-y-4">
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
        <div className="skeleton h-4 w-20 mt-10" />
      </div>
    </>
  );
}
