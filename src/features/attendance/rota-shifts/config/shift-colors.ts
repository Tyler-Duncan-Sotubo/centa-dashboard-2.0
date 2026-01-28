export const shiftBorderClassMap: Record<string, string> = {
  "Morning Shift": "border-l-green-500",
  "Evening Shift": "border-l-yellow-500",
  "Night Shift": "border-l-purple-500",
  default: "border-l-blue-500",
};

export function getShiftBorderClass(shiftName: string) {
  return shiftBorderClassMap[shiftName] || shiftBorderClassMap.default;
}
