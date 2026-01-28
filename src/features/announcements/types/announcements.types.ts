export type ReactionCount = {
  reactionType: string;
  count: string;
};

export type ReactionCounts = Record<string, number | string>;

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: string;
  role: string;
  createdBy: string;
  avatarUrl?: string;
  publishedAt: string;
  commentCount: number;
  reactionCounts: ReactionCounts;
};
