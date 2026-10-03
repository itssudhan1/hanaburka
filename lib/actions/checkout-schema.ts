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
