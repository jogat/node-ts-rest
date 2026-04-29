type ServiceConstructor<T> = new (...args: any[]) => T;

export class ServiceContainer {
  private services = new Map<Function, unknown>();

  register<T>(serviceClass: ServiceConstructor<T>, instance: T): void {
    this.services.set(serviceClass, instance);
  }

  resolve<T>(serviceClass: ServiceConstructor<T>): T {
    const service = this.services.get(serviceClass);

    if (!service) {
      throw new Error(`Service "${serviceClass.name}" is not registered in the container.`);
    }

    return service as T;
  }
}
