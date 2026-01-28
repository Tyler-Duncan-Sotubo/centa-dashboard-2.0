"use client";

import { useMemo } from "react";
import { stripHtml, truncateWords } from "../../lib/text";
import { formatRole } from "../../lib/role";
import { buildTopReactionsFromCounts, reactionMap } from "../../lib/reactions";
import type {
  Announcement,
  ReactionCount,
} from "../../types/announcements.types";

export function useAnnouncementCard(announcement: Announcement) {
  return useMemo(() => {
    const plainText = stripHtml(announcement.body);
    const previewText = truncateWords(plainText, 50);

    const { totalCount, topReactions } = buildTopReactionsFromCounts(
      announcement.reactionCounts as ReactionCount,
      2,
    );

    return {
      previewText,
      roleLabel: formatRole(announcement.role),
      totalCount,
      topReactions,
      reactionMap,
    };
  }, [announcement]);
}
