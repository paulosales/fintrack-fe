export interface Currency {
  id: number;
  code: string;
  name: string;
}

export interface ExchangeRate {
  date: string;
  from: string;
  to: string;
  rate: number;
}
