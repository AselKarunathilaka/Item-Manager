export const DEFAULT_CURRENCY = 'LKR';

const fallbackCurrencies = [
  'AED', 'AUD', 'BDT', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'INR',
  'JPY', 'KRW', 'LKR', 'MYR', 'NPR', 'NZD', 'PKR', 'QAR', 'SAR', 'SGD',
  'THB', 'USD', 'ZAR'
];

export const supportedCurrencies = Object.freeze(
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('currency')
    : fallbackCurrencies
);

const supportedCurrencySet = new Set(supportedCurrencies);

export function isSupportedCurrency(currency) {
  return supportedCurrencySet.has(currency);
}
