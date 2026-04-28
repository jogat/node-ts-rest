export type ResourceMeta = Record<string, unknown>;

export type ResourceResponse<TData> = {
  message?: string;
  data: TData;
  meta?: ResourceMeta;
};

export type ResourceResponseOptions = {
  message?: string;
  meta?: ResourceMeta;
};

export type JsonResourceConstructor<TResource, TData> = new (resource: TResource) => JsonResource<TResource, TData>;

export abstract class JsonResource<TResource, TData = unknown> {
  constructor(protected readonly resource: TResource) {}

  abstract toArray(): TData;

  toResponse(options: ResourceResponseOptions = {}): ResourceResponse<TData> {
    return makeResourceResponse(this.toArray(), options);
  }

  static make<TResource, TData, TResourceClass extends JsonResource<TResource, TData>>(
    this: new (resource: TResource) => TResourceClass,
    resource: TResource
  ): TResourceClass {
    return new this(resource);
  }

  static collection<TResource, TData>(
    resources: TResource[],
    ResourceClass: JsonResourceConstructor<TResource, TData>
  ): ResourceCollection<TResource, TData> {
    return new ResourceCollection(resources, ResourceClass);
  }
}

export class ResourceCollection<TResource, TData> {
  constructor(
    private readonly resources: TResource[],
    private readonly ResourceClass: JsonResourceConstructor<TResource, TData>
  ) {}

  toArray(): TData[] {
    return this.resources.map((resource) => new this.ResourceClass(resource).toArray());
  }

  toResponse(options: ResourceResponseOptions = {}): ResourceResponse<TData[]> {
    return makeResourceResponse(this.toArray(), options);
  }
}

function makeResourceResponse<TData>(data: TData, options: ResourceResponseOptions): ResourceResponse<TData> {
  const response = {} as ResourceResponse<TData>;

  if (options.message !== undefined) {
    response.message = options.message;
  }

  response.data = data;

  if (options.meta !== undefined) {
    response.meta = options.meta;
  }

  return response;
}
