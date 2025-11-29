export function calculateDepreciatedValue({
  purchasePrice,
  purchaseDate,
  usefulLifeYears,
}: {
  purchasePrice: number;
  purchaseDate: string;
  usefulLifeYears: number;
}): number {
  const yearsUsed =
    new Date().getFullYear() - new Date(purchaseDate).getFullYear();
  const depreciation = purchasePrice / usefulLifeYears;
  const value = purchasePrice - depreciation * yearsUsed;
  return Math.max(0, parseFloat(value.toFixed(2)));
}
