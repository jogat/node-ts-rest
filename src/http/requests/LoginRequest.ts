import { z } from "zod";
import { FormRequest } from "@http/requests/FormRequest";

export const loginRequestSchema = z.object({
  email: z.string().trim().email("Email must be a valid email address"),
  password: z.string().min(1, "Password is required"),
  token_name: z.string().trim().min(1, "Token name is required").max(255, "Token name may not be greater than 255 characters").default("API Token"),
});

export type LoginRequestData = z.infer<typeof loginRequestSchema>;

export class LoginRequest extends FormRequest {
  rules() {
    return {
      body: loginRequestSchema,
    };
  }
}
