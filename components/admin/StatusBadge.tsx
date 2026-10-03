// Small color-coded pill for order status — lets staff scan the orders
// table and spot what needs attention (pending/returned) without reading
// every row. Colors are semantic only: green = resolved, amber = needs
// action soon, red = needs attention now, blue = in progress.
const STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-info/10 text-info",
  processing: "bg-info/10 text-info",
  packed: "bg-info/10 text-info",
  shipped: "bg-info/10 text-info",
  out_for_delivery: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
  return_requested: "bg-warning/10 text-warning",
  returned: "bg-danger/10 text-danger",
  refunded: "bg-danger/10 text-danger",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${
        STYLES[status] ?? "bg-mocha/10 text-charcoal/70"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
