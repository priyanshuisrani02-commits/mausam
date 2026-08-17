"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProductReview = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  approved: boolean;
  created_at: string;
  products: { name: string }[] | null;
};

type Filter = "all" | "pending" | "approved";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [processingId, setProcessingId] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("product_reviews")
        .select(`
          id,
          product_id,
          customer_name,
          rating,
          review_text,
          approved,
          created_at,
          products!product_reviews_product_id_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      setReviews((data ?? []) as ProductReview[]);
    } catch (loadError) {
      console.error("Failed to load reviews:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load reviews."
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredReviews = useMemo(() => {
    if (filter === "approved") {
      return reviews.filter((review) => review.approved);
    }

    if (filter === "pending") {
      return reviews.filter((review) => !review.approved);
    }

    return reviews;
  }, [reviews, filter]);

  async function updateApproval(id: string, approved: boolean) {
    try {
      setProcessingId(id);

      const { error: updateError } = await supabase
        .from("product_reviews")
        .update({ approved })
        .eq("id", id);

      if (updateError) throw updateError;

      setReviews((current) =>
        current.map((review) =>
          review.id === id ? { ...review, approved } : review
        )
      );
    } catch (updateError) {
      console.error("Failed to update review:", updateError);
      alert(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update review."
      );
    } finally {
      setProcessingId("");
    }
  }

  async function deleteReview(id: string) {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setProcessingId(id);

      const { error: deleteError } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setReviews((current) =>
        current.filter((review) => review.id !== id)
      );
    } catch (deleteError) {
      console.error("Failed to delete review:", deleteError);
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete review."
      );
    } finally {
      setProcessingId("");
    }
  }

  function renderStars(rating: number) {
    return "★".repeat(Math.max(0, Math.min(5, rating))) +
      "☆".repeat(Math.max(0, 5 - rating));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const approvedReviews = reviews.filter((review) => review.approved).length;
  const pendingReviews = reviews.length - approvedReviews;

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-light md:text-5xl">Customer Reviews</h1>
        <p className="mt-3 text-gray-500">
          Approve, hide, or remove customer reviews before they appear publicly.
        </p>
      </div>

      {!loading && !error && (
        <>
          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <p className="text-4xl font-light">{reviews.length}</p>
              <p className="mt-2 text-sm text-gray-500">Total Reviews</p>
            </div>
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <p className="text-4xl font-light">{pendingReviews}</p>
              <p className="mt-2 text-sm text-gray-500">Pending Reviews</p>
            </div>
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <p className="text-4xl font-light">{approvedReviews}</p>
              <p className="mt-2 text-sm text-gray-500">Approved Reviews</p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {(["all", "pending", "approved"] as Filter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  filter === value
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {value === "all"
                  ? "All"
                  : value === "pending"
                    ? "Pending"
                    : "Approved"}
              </button>
            ))}
          </div>
        </>
      )}

      {loading ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <h2 className="text-2xl font-light">Something went wrong</h2>
          <p className="mt-3 text-gray-500">{error}</p>
          <button
            type="button"
            onClick={loadReviews}
            className="mt-6 rounded-full bg-black px-6 py-3 text-white"
          >
            Retry
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-sm">
          <div className="text-5xl">⭐</div>
          <h2 className="mt-5 text-2xl font-light">No reviews here</h2>
          <p className="mt-2 text-gray-500">
            Customer reviews will appear here when submitted.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[32px] bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-6 text-left text-sm font-medium">Product</th>
                    <th className="p-6 text-left text-sm font-medium">Customer</th>
                    <th className="p-6 text-left text-sm font-medium">Rating</th>
                    <th className="p-6 text-left text-sm font-medium">Review</th>
                    <th className="p-6 text-left text-sm font-medium">Status</th>
                    <th className="p-6 text-left text-sm font-medium">Date</th>
                    <th className="p-6 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b last:border-b-0">
                      <td className="p-6 font-medium">
                        {review.products?.[0]?.name ?? "Product no longer available"}
                      </td>
                      <td className="p-6">{review.customer_name}</td>
                      <td className="p-6 text-yellow-600">
                        {renderStars(review.rating)}
                      </td>
                      <td className="max-w-sm p-6 text-gray-600">
                        {review.review_text}
                      </td>
                      <td className="p-6">
                        <span
                          className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                            review.approved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {review.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {formatDate(review.created_at)}
                      </td>
                      <td className="p-6">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={processingId === review.id}
                            onClick={() =>
                              updateApproval(review.id, !review.approved)
                            }
                            className="rounded-full border border-gray-400 px-4 py-2 text-sm disabled:opacity-50"
                          >
                            {review.approved ? "Hide" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={processingId === review.id}
                            onClick={() => deleteReview(review.id)}
                            className="rounded-full border border-red-500 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="font-medium">
                  {review.products?.[0]?.name ?? "Product no longer available"}
                </p>
                <p className="mt-2 text-sm text-gray-500">{review.customer_name}</p>
                <p className="mt-4 text-yellow-600">{renderStars(review.rating)}</p>
                <p className="mt-4 text-gray-700">{review.review_text}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      review.approved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {review.approved ? "Approved" : "Pending"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={processingId === review.id}
                    onClick={() => updateApproval(review.id, !review.approved)}
                    className="rounded-full border border-gray-400 px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {review.approved ? "Hide" : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={processingId === review.id}
                    onClick={() => deleteReview(review.id)}
                    className="rounded-full border border-red-500 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
