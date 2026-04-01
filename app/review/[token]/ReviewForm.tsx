"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type ReviewState = "active" | "used" | "expired" | "invalid_job_state" | "missing";

export default function ReviewForm({
  token,
  initialState,
  job,
  review,
}: {
  token: string;
  initialState: ReviewState;
  job: {
    type: string;
    description: string;
    completedAt: string | Date | null;
    customerName: string | null;
    technicianName: string | null;
  };
  review: {
    rating: number;
    comment: string | null;
    label: string;
    createdAt: string | Date;
  } | null;
}) {
  const [state, setState] = useState<ReviewState>(initialState);
  const [rating, setRating] = useState(review?.rating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(review?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReview, setSubmittedReview] = useState(review);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please choose a rating from 1 to 5 stars.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit review.");
        return;
      }

      setSubmittedReview({
        rating: data.review.rating,
        comment: data.review.comment,
        label: data.review.label,
        createdAt: new Date().toISOString(),
      });
      setState("used");
    } catch (err) {
      setError("Something went wrong while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  const title =
    state === "used"
      ? "Thanks for your feedback"
      : state === "expired"
        ? "This review link has expired"
        : state === "invalid_job_state"
          ? "This job is not ready for review"
          : "Rate your completed job";

  const stateCard = getStateCard(state, submittedReview);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff4cc_0%,#fff8e7_35%,#fffdf5_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden border border-yellow-200 bg-white shadow-[0_20px_80px_rgba(255,197,38,0.18)]">
          <div className="border-b border-yellow-200 bg-gradient-to-r from-[#ffc526] via-[#ffcf47] to-[#e0a800] px-8 py-10 text-stone-900">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-700">TradeCarePlus</p>
            <h1 className="mt-3 text-3xl font-bold">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-stone-700">
              {job.customerName ? `Hi ${job.customerName}, ` : ""}
              share how your service experience went. Your feedback helps the team improve.
            </p>
          </div>

          <div className="grid gap-8 px-8 py-8">
            <section className="space-y-5">
              <div className={`rounded-2xl border px-5 py-4 ${stateCard.wrapperClass}`}>
                <p className={`text-sm font-semibold ${stateCard.titleClass}`}>{stateCard.title}</p>
                <p className={`mt-2 text-sm leading-6 ${stateCard.bodyClass}`}>{stateCard.description}</p>
                {state === "used" && submittedReview && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={20}
                          className={index < submittedReview.rating ? "fill-yellow-400 text-yellow-400" : "text-stone-300"}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-stone-700">{submittedReview.label}</p>
                    {submittedReview.comment && (
                      <p className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">
                        "{submittedReview.comment}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Job</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">{job.type.replaceAll("_", " ")}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-600">{job.description}</p>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                <p className="text-sm text-stone-500">
                  Completed: {job.completedAt ? new Date(job.completedAt).toLocaleString() : "Recently marked complete"}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Technician: {job.technicianName || "TradeCarePlus team"}
                </p>
              </div>

              {state === "active" && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Your rating</p>
                    <div className="mt-3 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = (hovered || rating) >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onMouseEnter={() => setHovered(value)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(value)}
                            className="rounded-full p-1 transition-transform hover:scale-110"
                            aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={active ? "fill-yellow-400 text-yellow-400" : "text-stone-300"}
                              size={34}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="text-sm font-semibold text-stone-800">
                      Optional comment
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      maxLength={1000}
                      className="mt-3 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none ring-0 transition focus:border-yellow-400"
                      placeholder="Tell us what went well or what could be better."
                    />
                  </div>

                  {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-stone-900 transition hover:bg-[#eab308] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Submit rating"}
                  </button>
                </form>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function getStateCard(
  state: ReviewState,
  submittedReview: {
    rating: number;
    comment: string | null;
    label: string;
    createdAt: string | Date;
  } | null
) {
  if (state === "used") {
    return {
      title: "Your review has already been submitted",
      description: submittedReview
        ? `We received your ${submittedReview.rating} star review. Thank you for taking the time to share your feedback.`
        : "We have already received your feedback for this job.",
      wrapperClass: "border-yellow-200 bg-yellow-50",
      titleClass: "text-stone-900",
      bodyClass: "text-stone-700",
    };
  }

  if (state === "expired") {
    return {
      title: "This review link has expired",
      description: "This secure review link is no longer active. Please contact TradeCarePlus if you still want to leave feedback.",
      wrapperClass: "border-stone-200 bg-stone-50",
      titleClass: "text-stone-900",
      bodyClass: "text-stone-600",
    };
  }

  if (state === "invalid_job_state") {
    return {
      title: "Review not available yet",
      description: "This job is not marked as completed yet, so feedback cannot be submitted from this link right now.",
      wrapperClass: "border-stone-200 bg-stone-50",
      titleClass: "text-stone-900",
      bodyClass: "text-stone-600",
    };
  }

  if (state === "missing") {
    return {
      title: "This review link is invalid",
      description: "We could not find a matching review request for this link. Please check the email link or contact TradeCarePlus.",
      wrapperClass: "border-red-200 bg-red-50",
      titleClass: "text-red-700",
      bodyClass: "text-red-600",
    };
  }

  return {
    title: "Please rate your completed job",
    description: "This secure page lets you leave a 1 to 5 star review without signing in. You can also add an optional comment.",
    wrapperClass: "border-yellow-200 bg-yellow-50",
    titleClass: "text-stone-900",
    bodyClass: "text-stone-700",
  };
}
