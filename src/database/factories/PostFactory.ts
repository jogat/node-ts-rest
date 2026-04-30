import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import { PostRow } from "@models/Post";
import type { CreatePostData } from "@models/Post";
import type { UserRow } from "@models/User";
import { userFactory } from "@database/factories/UserFactory";
import { PostService } from "@services/PostService";
import { User } from "@models/User";

type PostFactoryTransientParams = {
  user?: UserRow;
};

const factory = Factory.define<CreatePostData, PostFactoryTransientParams>(({ sequence, transientParams }) => {
  const title = faker.lorem.sentence({ min: 3, max: 6 }).replace(/\.$/, "");

  return {
    user_id: transientParams.user?.id ?? 1,
    title,
    body: faker.lorem.paragraph(),
    slug: `${faker.helpers.slugify(title).toLowerCase()}-${sequence}`,
    published: false,
  };
});

export const postFactory = {
  build(overrides: Partial<CreatePostData> = {}, transient: PostFactoryTransientParams = {}): CreatePostData {
    return factory.build(overrides, { transient });
  },

  buildList(count: number, overrides: Partial<CreatePostData> = {}, transient: PostFactoryTransientParams = {}): CreatePostData[] {
    return factory.buildList(count, overrides, { transient });
  },

  async create(overrides: Partial<CreatePostData> = {}, transient: PostFactoryTransientParams = {}): Promise<PostRow> {
    const user = transient.user ?? (overrides.user_id ? await User.find(overrides.user_id) : await userFactory.create());

    if (!user) {
      throw new Error("Post owner was not found.");
    }

    const data = this.build(
      {
        ...overrides,
        user_id: overrides.user_id ?? user.id,
      },
      transient
    );

    return new PostService().create(user, {
      title: data.title,
      body: data.body,
      published: data.published,
    });
  },
};
