import { describe, expect, it } from 'vitest';
import { currencyOptions, DEFAULT_CURRENCY, formatMoney } from './currencies';

describe('currency helpers', () => {
  it('uses Sri Lankan rupees as the primary currency', () => {
    expect(DEFAULT_CURRENCY).toBe('LKR');
    expect(currencyOptions[0].code).toBe('LKR');
    expect(formatMoney(1250, 'LKR')).toMatch(/^Rs/);
  });

  it('keeps the ISO code visible for foreign currencies', () => {
    expect(formatMoney(25, 'USD')).toContain('USD');
    expect(formatMoney(25, 'EUR')).toContain('EUR');
  });
});
