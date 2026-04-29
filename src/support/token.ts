import crypto from "crypto";
import { hashToken } from "@support/hashToken";

export type PlainAccessToken = {
  plainTextToken: string;
  tokenHash: string;
};

export function createPlainAccessToken(): PlainAccessToken {
  const plainTextToken = crypto.randomBytes(40).toString("hex");

  return {
    plainTextToken,
    tokenHash: hashToken(plainTextToken),
  };
}
