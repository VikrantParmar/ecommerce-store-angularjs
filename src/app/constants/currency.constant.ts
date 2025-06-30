export type SupportedCurrency = 'INR' | 'USD';

export const CURRENCY_CONFIG: Record<SupportedCurrency, {
  code: string;
  symbol: string;
  locale: string;
}> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US'
  }
};

export const CURRENT_CURRENCY: SupportedCurrency = 'INR';


const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 0.012
};


export function formatPrice(value: number | string): string {
  const config = CURRENCY_CONFIG[CURRENT_CURRENCY];
  const rate = EXCHANGE_RATES[CURRENT_CURRENCY];

  if (value == null || value === '') return `${config.symbol}0.00`;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  const convertedValue = num * rate;

  return convertedValue.toLocaleString(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}




















// Without convert currency

// export type SupportedCurrency = 'INR' | 'USD';

// export const CURRENCY_CONFIG: Record<SupportedCurrency, {
//   code: string;
//   symbol: string;
//   locale: string;
// }> = {
//   INR: {
//     code: 'INR',
//     symbol: '₹',
//     locale: 'en-IN'
//   },
//   USD: {
//     code: 'USD',
//     symbol: '$',
//     locale: 'en-US'
//   }
// };

// export const CURRENT_CURRENCY: SupportedCurrency = 'INR';

// export function formatPrice(value: number | string): string {
//   const config = CURRENCY_CONFIG[CURRENT_CURRENCY];

//   if (value == null || value === '') return `${config.symbol}0.00`;

//   const num = typeof value === 'string' ? parseFloat(value) : value;

//   return num.toLocaleString(config.locale, {
//     style: 'currency',
//     currency: config.code,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   });
// }
