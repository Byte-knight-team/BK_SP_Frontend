import { useState } from 'react';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';
import { submitCustomerReview } from '../../../apis/customer/orders';

export default function ReviewModal({ order, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [orderRating, setOrderRating] = useState(0);
  const [orderComment, setOrderComment] = useState('');
  const [itemReviews, setItemReviews] = useState({});

  const handleItemRatingChange = (itemId, rating) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating },
    }));
  };

  const handleItemCommentChange = (itemId, comment) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment },
    }));
  };

  const handleSubmit = async () => {
    setError('');

    let payloadOrderReview = null;
    if (orderRating > 0) {
      payloadOrderReview = { rating: orderRating, comment: orderComment };
    }

    const payloadItemReviews = [];
    Object.keys(itemReviews).forEach((itemId) => {
      const rev = itemReviews[itemId];
      if (rev.rating > 0) {
        payloadItemReviews.push({
          orderItemId: Number(itemId),
          rating: rev.rating,
          comment: rev.comment || '',
        });
      }
    });

    if (!payloadOrderReview && payloadItemReviews.length === 0) {
      setError('Please provide at least one rating to submit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCustomerReview(order.orderId, {
        orderReview: payloadOrderReview,
        itemReviews: payloadItemReviews,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        onSuccess();
      } else {
        setError(json.message || 'Failed to submit review.');
      }
    } catch {
      setError('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRate) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={`${
              star <= currentRating
                ? 'fill-orange-400 text-orange-400'
                : 'fill-slate-100 text-slate-200 hover:text-orange-200'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-xl font-heading font-bold text-navy">Leave a Review</h2>
            <p className="text-xs text-slate-500">Order #{order.orderNumber || order.orderId}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h3 className="mb-1 font-bold text-slate-800">Overall Experience</h3>
            <p className="mb-3 text-xs text-slate-500">How was your overall order experience?</p>
            <div className="mb-4">{renderStars(orderRating, setOrderRating)}</div>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-orange-500"
              placeholder="Tell us what you liked or what we can improve..."
              value={orderComment}
              onChange={(e) => setOrderComment(e.target.value)}
            />
          </div>

          <hr className="mb-6 border-slate-100" />

          <div>
            <h3 className="mb-1 font-bold text-slate-800">Rate the Items</h3>
            <p className="mb-4 text-xs text-slate-500">You can optionally rate specific items from your order.</p>

            <div className="space-y-6">
              {order.items?.map((item) => {
                const itemRev = itemReviews[item.orderItemId] || { rating: 0, comment: '' };
                const isAlreadyReviewed = item.isReviewed;

                return (
                  <div key={item.orderItemId} className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    {isAlreadyReviewed && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-[1px]">
                        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-green-600 shadow-sm">
                          <CheckCircle2 size={12} /> Already Reviewed
                        </span>
                      </div>
                    )}
                    <p className="mb-2 text-sm font-semibold text-slate-800">{item.itemName}</p>
                    <div className="mb-3">{renderStars(itemRev.rating, (r) => handleItemRatingChange(item.orderItemId, r))}</div>
                    {itemRev.rating > 0 && (
                      <textarea
                        className="h-14 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none transition-colors focus:border-orange-500"
                        placeholder={`Any comments on the ${item.itemName}?`}
                        value={itemRev.comment}
                        onChange={(e) => handleItemCommentChange(item.orderItemId, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}