import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";
import { storePostRequestSchema } from "@http/requests/StorePostRequest";

export const updatePostRequestSchema = storePostRequestSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required",
    path: ["body"],
  }
);

export type UpdatePostRequestData = z.infer<typeof updatePostRequestSchema>;

export class UpdatePostRequest extends FormRequest {
  rules() {
    return {
      body: updatePostRequestSchema,
    };
  }
}
