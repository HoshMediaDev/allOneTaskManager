export class RateLimiter {
  private requests: number = 0;
  private resetTime: number = Date.now();

  constructor(
    private maxRequests: number,
    private timeWindow: number
  ) {}

  async waitForAvailability(): Promise<void> {
    const now = Date.now();
    
    if (now >= this.resetTime) {
      this.requests = 0;
      this.resetTime = now + this.timeWindow;
    }

    if (this.requests >= this.maxRequests) {
      const waitTime = this.resetTime - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForAvailability();
    }

    this.requests++;
  }

  reset(): void {
    this.requests = 0;
    this.resetTime = Date.now() + this.timeWindow;
  }
}