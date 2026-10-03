const FLOW = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered",
] as const;

const TERMINAL_LABELS: Record<string, string> = {
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  returned: "Returned",
  refunded: "Refunded",
};

// Only the terminal/exception states get a semantic color — cancellations
// and refunds need to stand out; a return in progress is a "needs
// attention soon" amber rather than a hard red.
const TERMINAL_STYLES: Record<string, string> = {
  cancelled: "text-danger border-danger/30",
  return_requested: "text-warning border-warning/30",
  returned: "text-danger border-danger/30",
  refunded: "text-danger border-danger/30",
};

export default function OrderStatusTimeline({ status }: { status: string }) {
  if (status in TERMINAL_LABELS) {
    return (
      <p className={`text-sm border inline-block px-4 py-2 ${TERMINAL_STYLES[status]}`}>
        {TERMINAL_LABELS[status]}
      </p>
    );
  }

  const currentIndex = FLOW.indexOf(status as (typeof FLOW)[number]);
  const isDelivered = status === "delivered";

  return (
    <div className="flex flex-wrap gap-2">
      {FLOW.map((step, i) => {
        const reached = i <= currentIndex;
        const isFinalStep = step === "delivered";
        return (
          <div
            key={step}
            className={`text-xs px-3 py-1.5 border ${
              reached && isFinalStep && isDelivered
                ? "bg-success text-white border-success"
                : reached
                ? "bg-espresso text-ivory border-espresso"
                : "border-mocha/30 text-charcoal/50"
            }`}
          >
            {step.replace(/_/g, " ")}
          </div>
        );
      })}
    </div>
  );
}
