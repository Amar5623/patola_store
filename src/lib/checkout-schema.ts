import { z } from "zod";
import { MAX_CART_LINES, MAX_QUANTITY_PER_ITEM } from "@/lib/config";

/**
 * Checkout validation shared by the browser form and the server functions.
 * Field limits also keep every value within Razorpay's 256-character note limit.
 */

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(8, `Enter a valid ${label}`)
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, "Digits, spaces, + and - only")
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 10 && digits <= 15;
    }, `Enter a valid ${label}`);

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: phone("phone number"),
  whatsapp: phone("WhatsApp number"),
  whatsappConsent: z.boolean(),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  apartment: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  postalCode: z
    .string()
    .trim()
    .min(4, "Enter a valid postal code")
    .max(12)
    .regex(/^[A-Za-z0-9\s-]+$/, "Enter a valid postal code"),
  country: z.string().trim().min(2, "Enter your country").max(80),
});

export type CustomerDetails = z.infer<typeof customerSchema>;

export const cartLinesSchema = z
  .array(
    z.object({
      slug: z.string().trim().min(1).max(120),
      quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
    }),
  )
  .min(1)
  .max(MAX_CART_LINES);
