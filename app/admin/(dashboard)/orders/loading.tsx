export default function OrdersLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-32 mb-6" />
      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-mocha/10">
                <td className="p-3"><div className="skeleton h-4 w-20" /></td>
                <td className="p-3"><div className="skeleton h-4 w-28" /></td>
                <td className="p-3"><div className="skeleton h-5 w-16 rounded" /></td>
                <td className="p-3"><div className="skeleton h-4 w-14" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
