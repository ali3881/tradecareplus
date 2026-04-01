import { getReviewRequestByToken, getReviewRequestState } from "@/lib/reviews";
import ReviewForm from "./ReviewForm";

export default async function JobReviewPage({
  params,
}: {
  params: { token: string };
}) {
  const reviewRequest = await getReviewRequestByToken(params.token);
  const state = getReviewRequestState(reviewRequest);

  const job = reviewRequest
    ? {
        type: reviewRequest.serviceRequest.type,
        description: reviewRequest.serviceRequest.description,
        completedAt: reviewRequest.serviceRequest.completedAt,
        customerName: reviewRequest.serviceRequest.user.name,
        technicianName: reviewRequest.serviceRequest.assignedTo?.name || null,
      }
    : {
        type: "Service job",
        description: "We could not load this job review request.",
        completedAt: null,
        customerName: null,
        technicianName: null,
      };

  const review = reviewRequest?.serviceRequest.review
    ? {
        rating: reviewRequest.serviceRequest.review.rating,
        comment: reviewRequest.serviceRequest.review.comment,
        label: `${reviewRequest.serviceRequest.review.rating}/5`,
        createdAt: reviewRequest.serviceRequest.review.createdAt,
      }
    : null;

  return (
    <ReviewForm
      token={params.token}
      initialState={state}
      job={job}
      review={review}
    />
  );
}
