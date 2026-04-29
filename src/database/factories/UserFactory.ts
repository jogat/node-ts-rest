import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import { User, UserRow } from "@models/User";
import type { CreateUserData } from "@models/User";
import { hashPassword } from "@support/password";

type UserFactoryTransientParams = {
  password?: string;
};

const factory = Factory.define<CreateUserData, UserFactoryTransientParams>(({ sequence, transientParams }) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    name: `${firstName} ${lastName}`,
    email: `user-${sequence}@example.com`,
    password: transientParams.password ?? "password123",
  };
});

export const userFactory = {
  build(overrides: Partial<CreateUserData> = {}, transient: UserFactoryTransientParams = {}): CreateUserData {
    return factory.build(overrides, { transient });
  },

  buildList(count: number, overrides: Partial<CreateUserData> = {}, transient: UserFactoryTransientParams = {}): CreateUserData[] {
    return factory.buildList(count, overrides, { transient });
  },

  async create(overrides: Partial<CreateUserData> = {}, transient: UserFactoryTransientParams = {}): Promise<UserRow> {
    const data = this.build(overrides, transient);

    return User.create({
      ...data,
      password: await hashPassword(transient.password ?? data.password),
    });
  },
};
