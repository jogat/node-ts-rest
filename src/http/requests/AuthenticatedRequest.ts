import { Request } from "express";
import { PersonalAccessTokenRow } from "@models/PersonalAccessToken";
import { UserRow } from "@models/User";

export type AuthenticatedRequest = Request & {
  user: UserRow;
  accessToken: PersonalAccessTokenRow;
};
