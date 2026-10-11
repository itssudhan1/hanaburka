import { z } from "zod";

export const checkoutSchemaBase = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  line1: z.string().min(1).max(300),
  area: z.string().max(120).optional(),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  pincode: z.string().min(4).max(10),
  country: z.string().default("India"),
  deliveryInstructions: z.string().max(500).optional(),
  orderNote: z.string().max(500).optional(),
});

export type BaseCheckoutFields = z.infer<typeof checkoutSchemaBase>;

const FIELD_LABELS: Record<string, string> = {
  name: "your name",
  phone: "your phone number",
  email: "your email address",
  line1: "your address",
  area: "your area",
  city: "your city",
  state: "your state",
  pincode: "your pincode",
  deliveryInstructions: "your delivery instructions",
  orderNote: "your order note",
};

/** Turns a failed checkout validation into a sentence a shopper can act on. */
export function describeCheckoutIssue(error: z.ZodError): string {
  const field = String(error.issues[0]?.path[0] ?? "");
  const label = FIELD_LABELS[field];
  return label
    ? `Please check ${label} and try again.`
    : "Please check your details and try again.";
}
