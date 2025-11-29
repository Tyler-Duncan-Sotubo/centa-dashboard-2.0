export type ReactionCounts = {
  like: number;
  celebrate: number;
  // You can expand here if you add more reactions
};

export type Announcement = {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  body: string;
  reactionCounts: ReactionCounts;
  commentCount: number;
  publishedAt: string; // ISO date string
  createdBy: string;
  role: string;
  avatarUrl: string;
};
