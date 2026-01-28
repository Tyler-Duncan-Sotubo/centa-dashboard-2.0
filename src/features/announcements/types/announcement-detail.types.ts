import { ReactionCount } from "./announcements.types";

export type CommentReaction = {
  reactionType: string;
  count: string | number;
};

export type Comment = {
  id: string;
  createdBy: string;
  avatarUrl?: string;
  comment: string;
  createdAt: string;
  reactions?: CommentReaction[];
};

export type AnnouncementDetail = {
  announcement: {
    id: string;
    title: string;
    body: string;
    publishedAt?: string | null;
  };
  likeCount: ReactionCount[];
  likedByCurrentUser: boolean;
  comments: Comment[];
};
