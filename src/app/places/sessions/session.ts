export class Session {
  public id: number;
  public status: string;
  public shouldCheckout: boolean;
  public didOpenCheckout: boolean;

  constructor(id: number, status: string, shouldCheckout: boolean, didOpenCheckout: boolean) {
    this.id = id;
    this.status = status;
    this.shouldCheckout = shouldCheckout;
    this.didOpenCheckout = didOpenCheckout;
  }
}