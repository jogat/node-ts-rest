import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import { PersonalAccessToken, PersonalAccessTokenRow } from "@models/PersonalAccessToken";
import type { CreatePersonalAccessTokenData } from "@models/PersonalAccessToken";
import type { UserRow } from "@models/User";
import { hashToken } from "@support/hashToken";
import { userFactory } from "@database/factories/UserFactory";

export type CreatedAccessToken = {
  token: PersonalAccessTokenRow;
  plainTextToken: string;
};

type AccessTokenFactoryTransientParams = {
  user?: UserRow;
  plainTextToken?: string;
};

const factory = Factory.define<CreatePersonalAccessTokenData, AccessTokenFactoryTransientParams>(({ sequence, transientParams }) => {
  const plainTextToken = transientParams.plainTextToken ?? `plain-token-${sequence}`;

  return {
    user_id: transientParams.user?.id ?? 1,
    name: faker.helpers.arrayElement(["Web", "Mobile", "CLI", "Feature Test"]),
    token_hash: hashToken(plainTextToken),
    abilities: null,
    expires_at: null,
  };
});

export const accessTokenFactory = {
  build(overrides: Partial<CreatePersonalAccessTokenData> = {}, transient: AccessTokenFactoryTransientParams = {}): CreatePersonalAccessTokenData {
    return factory.build(overrides, { transient });
  },

  buildList(
    count: number,
    overrides: Partial<CreatePersonalAccessTokenData> = {},
    transient: AccessTokenFactoryTransientParams = {}
  ): CreatePersonalAccessTokenData[] {
    return factory.buildList(count, overrides, { transient });
  },

  async create(overrides: Partial<CreatePersonalAccessTokenData> = {}, transient: AccessTokenFactoryTransientParams = {}): Promise<CreatedAccessToken> {
    const user = transient.user ?? (overrides.user_id ? undefined : await userFactory.create());
    const plainTextToken = transient.plainTextToken ?? faker.string.alphanumeric(40);
    const data = this.build(
      {
        ...overrides,
        user_id: overrides.user_id ?? user!.id,
        token_hash: overrides.token_hash ?? hashToken(plainTextToken),
      },
      {
        ...transient,
        plainTextToken,
      }
    );

    return {
      token: await PersonalAccessToken.create(data),
      plainTextToken,
    };
  },
};
