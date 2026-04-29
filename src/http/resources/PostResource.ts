import { PostRow } from "@models/Post";
import { JsonResource } from "@http/resources/JsonResource";

export type PostResourceData = {
  id: number;
  user_id: number | null;
  title: string;
  body: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string | null;
};

export class PostResource extends JsonResource<PostRow, PostResourceData> {
  toArray(): PostResourceData {
    return {
      id: this.resource.id,
      user_id: this.resource.user_id,
      title: this.resource.title,
      body: this.resource.body,
      slug: this.resource.slug,
      published: Boolean(this.resource.published),
      created_at: serializeDate(this.resource.created_at),
      updated_at: this.resource.updated_at ? serializeDate(this.resource.updated_at) : null,
    };
  }
}

function serializeDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
