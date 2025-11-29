export const formatCurrency = (
  amountInKobo: number,
  currency: string = "NGN"
) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountInKobo); // Convert kobo to naira
};

export const formatCurrencyRange = (
  amountInSubunits: number, // e.g., kobo, cents
  currency: string = "NGN"
) => {
  const amount = amountInSubunits; // Convert to major unit
  const locale = getLocaleFromCurrency(currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getLocaleFromCurrency = (currency: string): string => {
  const map: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE", // Germany
    GBP: "en-GB",
    NGN: "en-NG",
    GHS: "en-GH",
    KES: "en-KE",
    ZAR: "en-ZA",
    CAD: "en-CA",
    AUD: "en-AU",
    INR: "en-IN",
    JPY: "ja-JP",
    CNY: "zh-CN",
    AED: "ar-AE",
    BRL: "pt-BR",
  };

  return map[currency] || "en"; // fallback to 'en' for unknown
};
