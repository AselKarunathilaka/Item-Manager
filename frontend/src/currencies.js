export const DEFAULT_CURRENCY = 'LKR';

const fallbackCurrencies = [
  'AED', 'AUD', 'BDT', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'INR',
  'JPY', 'KRW', 'LKR', 'MYR', 'NPR', 'NZD', 'PKR', 'QAR', 'SAR', 'SGD',
  'THB', 'USD', 'ZAR'
];

const currencyCodes =
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('currency')
    : fallbackCurrencies;

const currencyNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'currency' })
    : null;

export const currencyOptions = currencyCodes
  .map((code) => ({
    code,
    name: currencyNames?.of(code) || code
  }))
  .sort((first, second) => {
    if (first.code === DEFAULT_CURRENCY) return -1;
    if (second.code === DEFAULT_CURRENCY) return 1;
    return first.name.localeCompare(second.name);
  });

export function normalizeCurrency(currency) {
  return currency || DEFAULT_CURRENCY;
}

export function formatMoney(value, currency = DEFAULT_CURRENCY) {
  const normalizedCurrency = normalizeCurrency(currency);

  try {
    return new Intl.NumberFormat(normalizedCurrency === 'LKR' ? 'en-LK' : 'en', {
      style: 'currency',
      currency: normalizedCurrency,
      currencyDisplay: normalizedCurrency === 'LKR' ? 'narrowSymbol' : 'code'
    }).format(Number(value) || 0);
  } catch {
    return `${normalizedCurrency} ${(Number(value) || 0).toFixed(2)}`;
  }
}
