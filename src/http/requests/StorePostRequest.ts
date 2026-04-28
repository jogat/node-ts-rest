import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";

export const storePostRequestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title may not be greater than 255 characters"),
  body: z.string().trim().min(1, "Body is required"),
  slug: z.string().trim().min(1, "Slug is required").max(255, "Slug may not be greater than 255 characters"),
  published: z.boolean().optional(),
});

export type StorePostRequestData = z.infer<typeof storePostRequestSchema>;

export class StorePostRequest extends FormRequest {
  rules() {
    return {
      body: storePostRequestSchema,
    };
  }
}
