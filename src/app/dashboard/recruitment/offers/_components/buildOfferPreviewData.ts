/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildOfferPreviewData({
  template,
  autoFilled,
  userInput,
}: {
  template: string;
  autoFilled: Record<string, any>;
  userInput: Record<string, any>;
}): Record<string, any> {
  const regex = /{{\s*([\w.]+)\s*}}/g;
  const matches = Array.from(template.matchAll(regex)).map((m) => m[1]);
  const uniqueKeys = Array.from(new Set(matches));

  const result: Record<string, any> = {};

  for (const key of uniqueKeys) {
    const parts = key.split(".");
    const base = userInput[key] ?? autoFilled[key] ?? `{{${key}}}`;

    if (parts.length === 1) {
      result[key] = base;
    } else {
      const [root, nested] = parts;
      if (!result[root]) result[root] = {};
      result[root][nested] =
        userInput[root]?.[nested] ?? autoFilled[root]?.[nested] ?? `{{${key}}}`;
    }
  }

  return result;
}
