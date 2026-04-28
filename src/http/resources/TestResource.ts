import { TestRequestData } from "@http/requests";
import { JsonResource } from "@http/resources/JsonResource";

export type TestResourceData = Pick<TestRequestData, "name" | "fruit">;

export class TestResource extends JsonResource<TestResourceData, TestResourceData> {
  toArray(): TestResourceData {
    return {
      name: this.resource.name,
      fruit: this.resource.fruit,
    };
  }
}
