import { useState } from 'react';
import { Star, X, Loader2, CheckCircle2} from 'lucide-react';
import { submitCustomerReview } from '../../apis/customer/orders';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ReviewModal({ order, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Main order review
  const [orderRating, setOrderRating] = useState(0);
  const [orderComment, setOrderComment] = useState('');

  // Item reviews: { [orderItemId]: { rating: 0, comment: '' } }
  const [itemReviews, setItemReviews] = useState({});

  const handleItemRatingChange = (itemId, rating) => {
    setItemReviews(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating }
    }));
  };
  // specific item the user clicked, and update only that item's rating/comment.
  const handleItemCommentChange = (itemId, comment) => {
    setItemReviews(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment }
    }));
  };
  
  // API SUBMISSION & PAYLOAD BUILDER
  const handleSubmit = async () => {
    setError('');
    
    // We only send data if a rating > 0 is provided.
    let payloadOrderReview = null;
    if (orderRating > 0) {
      payloadOrderReview = { rating: orderRating, comment: orderComment };
    }

    const payloadItemReviews = [];
    Object.keys(itemReviews).forEach(itemId => {
      const rev = itemReviews[itemId];
      if (rev.rating > 0) {
        payloadItemReviews.push({
          orderItemId: Number(itemId),
          rating: rev.rating,
          comment: rev.comment || ''
        });
      }
    });
    //check if atleast one review provided
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
    } catch (err) {
      setError('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRate) => {
    return (
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
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-heading font-bold text-navy">Leave a Review</h2>
            <p className="text-xs text-slate-500">Order #{order.orderNumber || order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Overall Experience */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-1">Overall Experience</h3>
            <p className="text-xs text-slate-500 mb-3">How was your overall order experience?</p>
            <div className="mb-4">{renderStars(orderRating, setOrderRating)}</div>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-orange-500 outline-none resize-none h-20 transition-colors"
              placeholder="Tell us what you liked or what we can improve..."
              value={orderComment}
              onChange={(e) => setOrderComment(e.target.value)}
            />
          </div>

          <hr className="border-slate-100 mb-6" />

          {/* Item Ratings */}
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Rate the Items</h3>
            <p className="text-xs text-slate-500 mb-4">You can optionally rate specific items from your order.</p>
            
            <div className="space-y-6">
              {order.items?.map((item) => {
                const itemRev = itemReviews[item.orderItemId] || { rating: 0, comment: '' };
                const isAlreadyReviewed = item.isReviewed;

                return (
                  <div key={item.orderItemId} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    {/*The Glass Overlay blocking already-reviewed items */}
                    {isAlreadyReviewed && (
                      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={12} /> Already Reviewed
                        </span>
                      </div>
                    )}
                    <p className="font-semibold text-slate-800 text-sm mb-2">{item.itemName}</p>
                    <div className="mb-3">{renderStars(itemRev.rating, (r) => handleItemRatingChange(item.orderItemId, r))}</div>
                    {itemRev.rating > 0 && (
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-orange-500 outline-none resize-none h-14 transition-colors"
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

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
