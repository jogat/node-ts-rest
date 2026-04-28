import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";

export const listPostsRequestSchema = z.object({
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").default(1),
  per_page: z.coerce
    .number()
    .int("Per page must be an integer")
    .min(1, "Per page must be at least 1")
    .max(100, "Per page may not be greater than 100")
    .default(15),
});

export type ListPostsRequestData = z.infer<typeof listPostsRequestSchema>;

export class ListPostsRequest extends FormRequest {
  rules() {
    return {
      query: listPostsRequestSchema,
    };
  }
}
