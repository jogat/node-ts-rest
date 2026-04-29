import { UnauthorizedException } from "@exceptions/UnauthorizedException";
import { EventDispatcher, UserLoggedIn, UserRegistered } from "@events";
import { LoginRequestData, RegisterRequestData } from "@http/requests";
import { PersonalAccessToken, PersonalAccessTokenRow } from "@models/PersonalAccessToken";
import { User, UserRow } from "@models/User";
import { hashPassword, verifyPassword } from "@support/password";
import { createPlainAccessToken } from "@support/token";

export class AuthService {
  constructor(private readonly events = new EventDispatcher()) {}

  async register(data: RegisterRequestData): Promise<{ user: UserRow; token: string; token_type: "Bearer" }> {
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

    await this.events.dispatch(new UserRegistered(user));

    return {
      user,
      token: plainAccessToken.plainTextToken,
      token_type: "Bearer",
    };
  }

  async login(data: LoginRequestData): Promise<{ user: UserRow; token: string; token_type: "Bearer" }> {
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

    await this.events.dispatch(new UserLoggedIn(user));

    return {
      user,
      token: plainAccessToken.plainTextToken,
      token_type: "Bearer",
    };
  }

  async logout(accessToken: PersonalAccessTokenRow): Promise<void> {
    await PersonalAccessToken.revoke(accessToken.id);
  }
}
