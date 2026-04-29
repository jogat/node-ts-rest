export interface JobHandler<TPayload = unknown> {
  handle(payload: TPayload): Promise<void>;
}
