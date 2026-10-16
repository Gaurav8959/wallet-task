export default class MoneyUtility {
  static toMinor(amount: number) {
    return Math.round(Number(amount) * 100);
  }

  static fromMinor(amount: number) {
    return amount / 100;
  }

  static add(balance: number, amount: number) {
    return this.fromMinor(this.toMinor(balance) + this.toMinor(amount));
  }

  static subtract(balance: number, amount: number) {
    return this.fromMinor(this.toMinor(balance) - this.toMinor(amount));
  }

  static isEqual(first: number, second: number) {
    return this.toMinor(first) === this.toMinor(second);
  }

  static hasSufficientBalance(balance: number, amount: number) {
    return this.toMinor(balance) >= this.toMinor(amount);
  }

  static hasValidPrecision(amount: number) {
    return Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6;
  }
}
