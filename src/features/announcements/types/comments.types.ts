export type CommentReaction = {
  reactionType: string;
  count: string;
};

export type Comment = {
  id: string;
  createdBy: string;
  avatarUrl?: string;
  comment: string;
  createdAt: string;
  reactions?: CommentReaction[];
};
