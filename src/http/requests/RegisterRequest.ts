import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";

export const registerRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name may not be greater than 255 characters"),
  email: z.string().trim().email("Email must be a valid email address").max(255, "Email may not be greater than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(255, "Password may not be greater than 255 characters"),
  token_name: z.string().trim().min(1, "Token name is required").max(255, "Token name may not be greater than 255 characters").default("API Token"),
});

export type RegisterRequestData = z.infer<typeof registerRequestSchema>;

export class RegisterRequest extends FormRequest {
  rules() {
    return {
      body: registerRequestSchema,
    };
  }
}
