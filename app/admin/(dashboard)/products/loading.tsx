export default function ProductsLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-9 w-32" />
      </div>
      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Published</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-mocha/10">
                <td className="p-3"><div className="skeleton h-4 w-32" /></td>
                <td className="p-3"><div className="skeleton h-4 w-20" /></td>
                <td className="p-3"><div className="skeleton h-4 w-12" /></td>
                <td className="p-3"><div className="skeleton h-4 w-8" /></td>
                <td className="p-3"><div className="skeleton h-4 w-8" /></td>
                <td className="p-3"><div className="skeleton h-4 w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
