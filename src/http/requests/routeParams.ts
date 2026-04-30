import { z } from "zod";

export const positiveIntegerParam = (name: string) => {
  return z.coerce.number().int(`${name} must be an integer`).min(1, `${name} must be at least 1`);
};

export const slugParam = (name: string) => {
  return z.string().trim().min(1, `${name} must be a non-empty string`);
};

export const routeParams = {
  positiveInteger: positiveIntegerParam,
  slug: slugParam,
};
