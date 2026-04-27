import { z } from "zod";

export const inventoryRequestSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  unit: z.string().min(1, "Unit is required"),
  requestedQuantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Quantity must be a positive number",
    }),
  chefNote: z.string().max(200, "Note is too long").optional(),
});
