import { StatusBadge } from "@/shared/ui/status-badge";
import { Review } from "@/types/performance/review.type";
import { format } from "date-fns";

export default function ReviewHeader({ review }: { review: Review }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Review Details</h2>
      <div className="space-y-2">
        <StatusBadge status={review.status} />

        {review.submittedAt && (
          <span className="text-sm text-muted-foreground">
            Submitted: {format(new Date(review.submittedAt), "PPP")}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div>
          <p className="font-medium">Reviewer</p>
          <p className="font-semibold">{review.reviewerName}</p>
        </div>
        <div>
          <p className="font-medium">Reviewee</p>
          <p className="font-semibold">{review.revieweeName}</p>
        </div>
        <span className="text-sm text-muted-foreground">
          Created: {format(new Date(review.createdAt), "PPP")}
        </span>
      </div>
    </div>
  );
}
