import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";

export const testRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  fruit: z.string().trim().min(1, "Fruit is required"),
});

export type TestRequestData = z.infer<typeof testRequestSchema>;

export class TestRequest extends FormRequest {
  rules() {
    return {
      body: testRequestSchema,
    };
  }
}
