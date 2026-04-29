import { NextFunction, Request, RequestHandler, Response } from "express";
import { UnauthorizedException } from "@exceptions/UnauthorizedException";
import { PersonalAccessTokenRow, PersonalAccessToken } from "@models/PersonalAccessToken";
import { UserRow } from "@models/User";
import { hashToken } from "@support/hashToken";

export const auth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plainToken = getBearerToken(req);
    const accessToken = await PersonalAccessToken.findByTokenHash(hashToken(plainToken));

    if (!accessToken || isRevoked(accessToken) || isExpired(accessToken)) {
      throw new UnauthorizedException();
    }

    const user = await PersonalAccessToken.user(accessToken);

    if (!user) {
      throw new UnauthorizedException();
    }

    await PersonalAccessToken.markUsed(accessToken.id);

    req.user = user;
    req.accessToken = accessToken;

    next();
  } catch (error) {
    next(error);
  }
};

function getBearerToken(req: Request): string {
  const header = req.header("authorization");

  if (!header) {
    throw new UnauthorizedException();
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    throw new UnauthorizedException();
  }

  return token;
}

function isRevoked(token: PersonalAccessTokenRow): boolean {
  return token.revoked_at !== null;
}

function isExpired(token: PersonalAccessTokenRow): boolean {
  return token.expires_at !== null && new Date(token.expires_at).getTime() <= Date.now();
}

declare global {
  namespace Express {
    interface Request {
      user?: UserRow;
      accessToken?: PersonalAccessTokenRow;
    }
  }
}
