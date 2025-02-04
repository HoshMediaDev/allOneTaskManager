export class GHLApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'GHLApiError';
    this.status = status;
    this.code = code;
  }
}