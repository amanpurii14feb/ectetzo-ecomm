"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Loader2,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  reviewer: string;
  verified: boolean;
};
type ReviewData = {
  rating: number;
  count: number;
  canReview: boolean;
  signedIn: boolean;
  ownReview: { rating: number; title: string | null; comment: string } | null;
  reviews: Review[];
};
const stars = [1, 2, 3, 4, 5],
  ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="premium-stars" aria-label={`${rating} out of 5 stars`}>
      {stars.map((value) => (
        <Star
          key={value}
          width={size}
          height={size}
          fill={value <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
function VerifiedBadge() {
  return (
    <span className="verified-review-badge">
      <CheckCircle2 />
      Verified Purchase
    </span>
  );
}
function RatingSummary({ data }: { data: ReviewData }) {
  const distribution = stars
    .map((value) => ({
      value,
      count: data.reviews.filter((review) => review.rating === value).length,
    }))
    .reverse();
  return (
    <article className="premium-review-card rating-overview">
      <span className="review-card-kicker">Overall rating</span>
      <div className="rating-score">
        <strong>{data.rating.toFixed(1)}</strong>
        <span>out of 5</span>
      </div>
      <Stars rating={data.rating} size={20} />
      <p>
        Based on{" "}
        <b>
          {data.count} verified {data.count === 1 ? "review" : "reviews"}
        </b>
      </p>
      <div className="rating-distribution">
        {distribution.map(({ value, count }) => {
          const percent = data.reviews.length
            ? Math.round((count / data.reviews.length) * 100)
            : 0;
          return (
            <div key={value}>
              <span>
                {value} <Star fill="currentColor" />
              </span>
              <i>
                <em style={{ width: `${percent}%` }} />
              </i>
              <b>{percent}%</b>
            </div>
          );
        })}
      </div>
    </article>
  );
}
function ReviewForm({
  data,
  productId,
  reload,
}: {
  data: ReviewData;
  productId: number;
  reload: () => Promise<void>;
}) {
  const [rating, setRating] = useState(data.ownReview?.rating || 5),
    [hovered, setHovered] = useState(0),
    [title, setTitle] = useState(data.ownReview?.title || ""),
    [comment, setComment] = useState(data.ownReview?.comment || ""),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);
  if (!data.canReview)
    return (
      <article className="premium-review-card review-locked">
        <CheckCircle2 />
        <div>
          <h3>Verified purchase reviews</h3>
          <p>
            {data.signedIn
              ? "You can review this product after your order is delivered."
              : "Sign in after receiving your order to leave a review."}
          </p>
          {!data.signedIn && <Link href="/login">Sign in to continue</Link>}
        </div>
      </article>
    );
  const editing = Boolean(data.ownReview);
  return (
    <article className="premium-review-card premium-review-form">
      <header>
        <span className="review-card-kicker">Your feedback</span>
        <h3>{editing ? "Edit your review" : "Write a review"}</h3>
        <p>Share your experience to help other customers.</p>
      </header>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (saving) return;
          setSaving(true);
          setMessage("");
          const response = await fetch(`/api/products/${productId}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, title, comment }),
          });
          const result = await response.json();
          setSaving(false);
          if (!response.ok)
            return setMessage(result.error || "Could not save review");
          setMessage("success");
          await reload();
        }}
      >
        <fieldset>
          <legend>Your rating</legend>
          <div
            className="review-star-picker"
            onMouseLeave={() => setHovered(0)}
          >
            {stars.map((value) => (
              <button
                type="button"
                key={value}
                onMouseEnter={() => setHovered(value)}
                onFocus={() => setHovered(value)}
                onClick={() => setRating(value)}
                aria-label={`${value} stars`}
              >
                <Star
                  fill={value <= (hovered || rating) ? "currentColor" : "none"}
                />
              </button>
            ))}
            <b>{ratingLabels[hovered || rating]}</b>
          </div>
        </fieldset>
        <label>
          Review title <span>{title.length} / 80</span>
          <input
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            placeholder="Summarize your experience"
          />
        </label>
        <label>
          Your review <span>{comment.length} / 1200</span>
          <textarea
            className="field"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            minLength={10}
            maxLength={1200}
            required
            placeholder="What did you like or dislike about this product?"
            rows={5}
          />
        </label>
        <button className="btn btn-dark review-submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="review-spinner" />
              Saving…
            </>
          ) : (
            <>
              <Send />
              {editing ? "Update Review" : "Submit Review"}
            </>
          )}
        </button>
        {message && (
          <div
            className={
              message === "success" ? "review-success" : "review-form-error"
            }
            role="status"
          >
            {message === "success" ? (
              <>
                <Check />
                <span>
                  <b>Thanks for your review!</b>
                  <small>Your feedback has been submitted successfully.</small>
                </span>
              </>
            ) : (
              message
            )}
          </div>
        )}
      </form>
    </article>
  );
}
function ReviewCard({ review }: { review: Review }) {
  const initials = review.reviewer
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <article className="customer-review-card">
      <header>
        <span className="review-avatar">{initials}</span>
        <div>
          <b>{review.reviewer}</b>
          {review.verified && <VerifiedBadge />}
        </div>
        <time>
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </header>
      <Stars rating={review.rating} />
      {review.title && <h4>{review.title}</h4>}
      <p>{review.comment}</p>
      <footer>
        <span>Was this review helpful?</span>
        <button>
          <ThumbsUp />
          Helpful
        </button>
        <button>
          <ThumbsDown />
          Not helpful
        </button>
      </footer>
    </article>
  );
}
function ReviewList({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<number | null>(null),
    [sort, setSort] = useState("recent");
  const visible = useMemo(
    () =>
      reviews
        .filter((review) => filter === null || review.rating === filter)
        .sort((a, b) =>
          sort === "rating"
            ? b.rating - a.rating
            : +new Date(b.createdAt) - +new Date(a.createdAt),
        ),
    [reviews, filter, sort],
  );
  return (
    <section className="customer-reviews-column">
      <div className="review-list-heading">
        <div>
          <span className="review-card-kicker">Customer feedback</span>
          <h3>
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </h3>
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort reviews"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
      <div className="review-filter-chips" aria-label="Filter reviews">
        <button
          className={filter === null ? "active" : ""}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        {[5, 4, 3].map((value) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => setFilter(value)}
          >
            {value} ★
          </button>
        ))}
      </div>
      <div className="premium-review-list">
        {visible.length ? (
          visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="reviews-empty">
            <Star />
            <b>No matching reviews</b>
            <p>Try another rating filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
export function ProductReviews({ productId }: { productId: number }) {
  const [data, setData] = useState<ReviewData | null>(null),
    [loadError, setLoadError] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setLoadError(
        result.error || "Could not load reviews. Please refresh and try again.",
      );
      return;
    }
    setData(await response.json());
  }, [productId]);
  useEffect(() => {
    void load();
  }, [load]);
  if (!data)
    return (
      <div className="premium-reviews-loading">
        {loadError || (
          <>
            <Loader2 />
            Loading customer reviews…
          </>
        )}
      </div>
    );
  return (
    <section className="premium-reviews-shell">
      <header className="premium-reviews-header">
        <div>
          <span className="review-card-kicker">Real experiences</span>
          <h2>Customer Reviews</h2>
          <div>
            <b>{data.rating.toFixed(1)} ★</b>
            <i />
            <span>
              {data.count} verified {data.count === 1 ? "review" : "reviews"}
            </span>
          </div>
          <p>See what customers are saying about this product.</p>
        </div>
        {data.canReview && (
          <a href="#review-form" className="btn btn-outline">
            Write a Review
          </a>
        )}
      </header>
      <div className="premium-reviews-grid">
        <RatingSummary data={data} />
        <div id="review-form">
          <ReviewForm data={data} productId={productId} reload={load} />
        </div>
        <ReviewList reviews={data.reviews} />
      </div>
    </section>
  );
}
