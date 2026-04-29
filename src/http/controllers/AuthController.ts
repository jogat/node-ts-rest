import { Request, Response } from "express";
import { UnauthorizedException } from "@exceptions/UnauthorizedException";
import { Controller } from "@http/controllers/Controller";
import { AuthenticatedRequest, LoginRequestData, RegisterRequestData, ValidatedRequest } from "@http/requests";
import { UserResource } from "@http/resources";
import { PersonalAccessToken } from "@models/PersonalAccessToken";
import { User } from "@models/User";
import { hashPassword, verifyPassword } from "@support/password";
import { createPlainAccessToken } from "@support/token";

type RegisterRequest = ValidatedRequest<{
  body: RegisterRequestData;
}>;

type LoginRequest = ValidatedRequest<{
  body: LoginRequestData;
}>;

export class AuthController extends Controller {
  register = async (req: Request, res: Response) => {
    const data = (req as RegisterRequest).validated.body;
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
    });
    const plainAccessToken = createPlainAccessToken();

    await PersonalAccessToken.create({
      user_id: user.id,
      name: data.token_name,
      token_hash: plainAccessToken.tokenHash,
    });

    return this.created(res, {
      user: UserResource.make(user).toArray(),
      token: plainAccessToken.plainTextToken,
      token_type: "Bearer",
    });
  };

  login = async (req: Request, res: Response) => {
    const data = (req as LoginRequest).validated.body;
    const user = await User.findByEmail(data.email);

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const plainAccessToken = createPlainAccessToken();

    await PersonalAccessToken.create({
      user_id: user.id,
      name: data.token_name,
      token_hash: plainAccessToken.tokenHash,
    });

    return this.data(res, {
      user: UserResource.make(user).toArray(),
      token: plainAccessToken.plainTextToken,
      token_type: "Bearer",
    });
  };

  me = async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    return this.resource(res, UserResource.make(user));
  };

  logout = async (req: Request, res: Response) => {
    const { accessToken } = req as AuthenticatedRequest;

    await PersonalAccessToken.revoke(accessToken.id);

    return this.noContent(res);
  };
}
