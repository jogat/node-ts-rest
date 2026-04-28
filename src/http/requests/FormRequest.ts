import { Request } from "express";
import { z } from "zod";

export type ValidationSource = "body" | "params" | "query";

export type RequestValidationSchemas = Partial<Record<ValidationSource, z.ZodTypeAny>>;

export type ValidatedData = Partial<Record<ValidationSource, unknown>>;

export type ValidatedRequest<TValidated extends ValidatedData = ValidatedData> = Request & {
  validated: TValidated;
};

export abstract class FormRequest<TSchemas extends RequestValidationSchemas = RequestValidationSchemas> {
  abstract rules(): TSchemas;
}

export type FormRequestConstructor<T extends FormRequest = FormRequest> = new () => T;
