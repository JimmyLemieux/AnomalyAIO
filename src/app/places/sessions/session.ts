export class Session {
  public id: number;
  public status: string;
  public shouldCheckout: boolean;
  public didOpenCheckout: boolean;
  public sort: number;

  constructor(id: number, status: string, shouldCheckout: boolean, didOpenCheckout: boolean, sort: number) {
    this.id = id;
    this.status = status;
    this.shouldCheckout = shouldCheckout;
    this.didOpenCheckout = didOpenCheckout;
    this.sort = sort;
  }
}