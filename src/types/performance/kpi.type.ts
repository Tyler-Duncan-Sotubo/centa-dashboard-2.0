// ---------- Types ----------
export type Dir = "up" | "down" | "range" | "boolean";
export type Unit = "percent" | "currency" | "count" | "number" | "boolean";

export type KpiDraft = {
  name: string;
  direction: Dir;
  unit?: Unit;
  baseline?: number | null;
  target?: number | null;
  targetMin?: number | null;
  targetMax?: number | null;
  weight?: number;
  isPrimary?: boolean;
  targetDate?: string; // YYYY-MM-DD
};

export type Kpi = {
  id: string;
  name: string;
  direction: Dir;
  unit?: Unit | null;
  baseline?: string | number | null;
  target?: string | number | null;
  targetMin?: string | number | null;
  targetMax?: string | number | null;
  current?: string | number | null;
  weight?: number | null;
  isPrimary?: boolean | null;
  targetDate?: string | null;
};
