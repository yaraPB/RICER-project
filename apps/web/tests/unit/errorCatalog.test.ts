import { describe, expect, it } from 'vitest';
import { ERROR_CATALOG, getCatalogEntry } from '@/lib/errors/catalog';
import { ERROR_CODE_RANGES } from '@/lib/errors/types';
import { translations } from '@/utils/translations';

describe('ERROR_CATALOG', () => {
  it('uses unique numeric codes', () => {
    const codes = Object.values(ERROR_CATALOG).map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('keeps codes within declared taxonomy ranges', () => {
    for (const e of Object.values(ERROR_CATALOG)) {
      const range =
        e.code >= ERROR_CODE_RANGES.CLIENT.min && e.code <= ERROR_CODE_RANGES.CLIENT.max
          ? 'CLIENT'
          : e.code >= ERROR_CODE_RANGES.AUTH.min && e.code <= ERROR_CODE_RANGES.AUTH.max
            ? 'AUTH'
            : e.code >= ERROR_CODE_RANGES.BUSINESS.min && e.code <= ERROR_CODE_RANGES.BUSINESS.max
              ? 'BUSINESS'
              : e.code >= ERROR_CODE_RANGES.EXTERNAL.min && e.code <= ERROR_CODE_RANGES.EXTERNAL.max
                ? 'EXTERNAL'
                : e.code >= ERROR_CODE_RANGES.SYSTEM.min && e.code <= ERROR_CODE_RANGES.SYSTEM.max
                  ? 'SYSTEM'
                  : null;
      expect(range).not.toBeNull();
    }
  });

  it('references existing localization keys', () => {
    for (const e of Object.values(ERROR_CATALOG)) {
      expect(translations.ar[e.userMessageKey]).toBeTruthy();
      expect(translations.fr[e.userMessageKey]).toBeTruthy();
      expect(translations.en[e.userMessageKey]).toBeTruthy();
    }
  });

  it('falls back to SYSTEM_UNEXPECTED for unknown codes', () => {
    expect(getCatalogEntry(9999).code).toBe(5000);
  });
});

