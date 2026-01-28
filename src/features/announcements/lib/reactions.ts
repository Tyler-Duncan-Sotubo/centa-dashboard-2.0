export const reactionMap: Record<string, string> = {
  like: "👍",
  celebrate: "🎉",
  love: "❤️",
  happy: "😄",
  clap: "👏",
  sad: "😢",
  angry: "😡",
};

export const reactionOptions = [
  { type: "like", label: "👍" },
  { type: "celebrate", label: "🎉" },
  { type: "love", label: "❤️" },
  { type: "happy", label: "😄" },
  { type: "clap", label: "👏" },
  { type: "sad", label: "😢" },
  { type: "angry", label: "😡" },
] as const;

export function buildTopReactionsFromCounts(
  counts: Record<string, string>,
  topN = 2,
) {
  const arr = Object.entries(counts ?? {}).map(([type, count]) => ({
    type,
    count: Number(count),
  }));

  const totalCount = arr.reduce((sum, r) => sum + r.count, 0);
  const topReactions = [...arr]
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return { totalCount, topReactions };
}

export function totalFromReactionArray(reactions: { count: string }[]) {
  return (reactions ?? []).reduce((sum, item) => sum + Number(item.count), 0);
}
