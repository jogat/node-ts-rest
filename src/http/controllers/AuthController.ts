import { Request, Response } from "express";
import { Controller } from "@http/controllers/Controller";
import { AuthenticatedRequest, LoginRequestData, RegisterRequestData, ValidatedRequest } from "@http/requests";
import { UserResource } from "@http/resources";
import { AuthService } from "@services/AuthService";

type RegisterRequest = ValidatedRequest<{
  body: RegisterRequestData;
}>;

type LoginRequest = ValidatedRequest<{
  body: LoginRequestData;
}>;

export class AuthController extends Controller {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    super();
    this.authService = authService;
  }

  register = async (req: Request, res: Response) => {
    const data = (req as RegisterRequest).validated.body;
    const payload = await this.authService.register(data);

    return this.created(res, {
      user: UserResource.make(payload.user).toArray(),
      token: payload.token,
      token_type: payload.token_type,
    });
  };

  login = async (req: Request, res: Response) => {
    const data = (req as LoginRequest).validated.body;
    const payload = await this.authService.login(data);

    return this.data(res, {
      user: UserResource.make(payload.user).toArray(),
      token: payload.token,
      token_type: payload.token_type,
    });
  };

  me = async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    return this.resource(res, UserResource.make(user));
  };

  logout = async (req: Request, res: Response) => {
    const { accessToken } = req as AuthenticatedRequest;

    await this.authService.logout(accessToken);

    return this.noContent(res);
  };
}
