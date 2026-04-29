import { UserRow } from "@models/User";
import { JsonResource } from "@http/resources/JsonResource";

export type UserResourceData = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string | null;
};

export class UserResource extends JsonResource<UserRow, UserResourceData> {
  toArray(): UserResourceData {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
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
