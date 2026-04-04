import currency from 'currency.js';

export const formatCurrency = (amount: number): string => {
  return currency(amount, {
    symbol: '$',
    precision: 2,
    separator: ',',
    decimal: '.',
  }).format();
};
