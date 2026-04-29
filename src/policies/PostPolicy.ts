import { PostRow } from "@models/Post";
import { UserRow } from "@models/User";

export class PostPolicy {
  create(user: UserRow): boolean {
    return Boolean(user);
  }

  view(user: UserRow, post: PostRow): boolean {
    return Boolean(user && post);
  }

  update(user: UserRow, post: PostRow): boolean {
    return post.user_id === user.id;
  }

  delete(user: UserRow, post: PostRow): boolean {
    return post.user_id === user.id;
  }
}
