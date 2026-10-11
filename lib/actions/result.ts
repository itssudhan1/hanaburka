/**
 * Result shape for server actions whose failures a customer is meant to
 * read ("sign in first", "not enough stock", "coupon expired"...).
 *
 * WHY NOT JUST `throw new Error(...)`: in production, Next.js replaces the
 * message of any error thrown out of a server action with a generic
 * "An error occurred in the Server Components render..." string, so the
 * browser never sees the real text (it only works in `next dev`). That's
 * how "Buy Now" looked fine locally but showed that generic text on the
 * live site, and why `err.message.includes("Sign in")` redirects silently
 * stopped working. Values that are RETURNED are never masked.
 *
 * Reserve `throw` for genuinely unexpected failures (bugs, outages).
 */
export type ActionFailure = {
  ok: false;
  code: "NOT_SIGNED_IN" | "FAILED";
  message: string;
};

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | ActionFailure;
