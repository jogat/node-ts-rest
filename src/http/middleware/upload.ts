import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import { config } from "@config/index";
import { ValidationException, ValidationErrors } from "@exceptions/ValidationException";
import { UploadedFile } from "@http/requests/UploadedFile";

export type FileValidationOptions = {
  required?: boolean;
  image?: boolean;
  mimeTypes?: string[];
  extensions?: string[];
  maxSize?: number;
};

const uploadParser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.upload.maxFileSize,
  },
});

export function uploadSingle(field: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    req.uploadedFile = () => undefined;

    uploadParser.single(field)(req, res, (error) => {
      if (!error) {
        req.uploadedFile = (requestedField: string): UploadedFile | undefined => {
          const file = req.file as Express.Multer.File | undefined;

          if (!file || file.fieldname !== requestedField) {
            return undefined;
          }

          return new UploadedFile(file);
        };
        next();
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(new ValidationException({ [field]: [`${formatField(field)} may not be greater than ${formatSize(config.storage.upload.maxFileSize)}`] }));
        return;
      }

      next(error);
    });
  };
}

export function validateUploadedFile(field: string, options: FileValidationOptions): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.uploadedFile?.(field);
    const errors: ValidationErrors = {};

    if (!file) {
      if (options.required) {
        errors[field] = [`${formatField(field)} is required`];
      }

      finishValidation(errors, next);
      return;
    }

    if (options.image && !file.mimeType.startsWith("image/")) {
      errors[field] = [...(errors[field] ?? []), `${formatField(field)} must be an image`];
    }

    if (options.mimeTypes && !options.mimeTypes.includes(file.mimeType)) {
      errors[field] = [...(errors[field] ?? []), `${formatField(field)} must be a file of type: ${formatAllowedTypes(options.extensions ?? options.mimeTypes)}`];
    }

    if (options.extensions && !options.extensions.includes(file.extension)) {
      errors[field] = [...(errors[field] ?? []), `${formatField(field)} must be a file of type: ${formatAllowedTypes(options.extensions)}`];
    }

    if (options.maxSize && file.size > options.maxSize) {
      errors[field] = [...(errors[field] ?? []), `${formatField(field)} may not be greater than ${formatSize(options.maxSize)}`];
    }

    finishValidation(errors, next);
  };
}

function finishValidation(errors: ValidationErrors, next: NextFunction): void {
  if (Object.keys(errors).length > 0) {
    next(new ValidationException(errors));
    return;
  }

  next();
}

function formatField(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAllowedTypes(types: string[]): string {
  return types.join(", ");
}

function formatSize(bytes: number): string {
  return `${Math.floor(bytes / 1024)} kilobytes`;
}

declare global {
  namespace Express {
    interface Request {
      uploadedFile(field: string): UploadedFile | undefined;
    }
  }
}
