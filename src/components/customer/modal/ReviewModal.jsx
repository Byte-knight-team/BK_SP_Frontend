import { useRef, useState } from 'react';
import { Star, X, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import {
  createCustomerReviewImagePresignUrls,
  submitCustomerReview,
  uploadFileToPresignedUrl,
} from '../../../apis/customer/orders';
import { useQueryClient } from '@tanstack/react-query';

// Maximum images allowed per review section (order-level or per item)
const MAX_IMAGES_PER_REVIEW = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ReviewModal({ order, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [orderRating, setOrderRating] = useState(0);
  const [orderComment, setOrderComment] = useState('');
  const [itemReviews, setItemReviews] = useState({});
  const [orderReviewImages, setOrderReviewImages] = useState([]);
  const [itemReviewImages, setItemReviewImages] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');

  const orderImageInputRef = useRef(null);
  const itemImageInputRefs = useRef({});

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

  // Validates new files against size and count limits, then APPENDS them
  // to the existing selection rather than replacing it.
  const validateAndFilterFiles = (newFiles, existingFiles) => {
    const combined = [...existingFiles];
    const errors = [];

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds the 5 MB size limit.`);
        continue;
      }
      if (combined.length >= MAX_IMAGES_PER_REVIEW) {
        errors.push(`Maximum of ${MAX_IMAGES_PER_REVIEW} images allowed.`);
        break;
      }
      combined.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
    }

    return combined;
  };

  const handleOrderReviewImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setOrderReviewImages((prev) => validateAndFilterFiles(files, prev));
    event.target.value = '';
  };

  const removeOrderImage = (index) => {
    setOrderReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemReviewImagesChange = (itemId, event) => {
    const files = Array.from(event.target.files || []);
    setItemReviewImages((prev) => ({
      ...prev,
      [itemId]: validateAndFilterFiles(files, prev[itemId] || []),
    }));
    event.target.value = '';
  };

  const removeItemImage = (itemId, index) => {
    setItemReviewImages((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || []).filter((_, i) => i !== index),
    }));
  };

  // Step 1 of 2: Ask the backend to generate presigned S3 PUT URLs.
  // The backend signs the URLs using its AWS credentials; the browser never sees those credentials.
  const requestPresignedUploads = async (files) => {
    if (!files.length) return [];

    let res;
    try {
      res = await createCustomerReviewImagePresignUrls(
        files.map((file) => ({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        }))
      );
    } catch {
      throw new Error('Could not connect to the server to prepare image uploads. Please check your connection and try again.');
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || 'Failed to prepare image uploads.');
    }

    return Array.isArray(json?.data) ? json.data : [];
  };

  // Step 2 of 2: Upload each file directly to S3 using its presigned URL,
  // then return structured entries { objectKey, fileName, contentType } for the review payload.
  const uploadImagesAndCollectEntries = async (files) => {
    if (!files.length) return [];

    const presignedUploads = await requestPresignedUploads(files);
    if (presignedUploads.length !== files.length) {
      throw new Error('Image upload preparation returned an unexpected result.');
    }

    const uploadedEntries = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const uploadInfo = presignedUploads[index];

      let uploadRes;
      try {
        uploadRes = await uploadFileToPresignedUrl(uploadInfo.uploadUrl, file);
      } catch {
        // Network-level failure on the S3 PUT — most commonly caused by a missing
        // CORS rule on the S3 bucket that blocks browser requests.
        throw new Error(
          `Could not upload "${file.name}" to cloud storage. ` +
          'This is usually caused by missing CORS configuration on your S3 bucket. ' +
          'Please add a CORS rule allowing PUT from your frontend origin.'
        );
      }

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload "${file.name}" (HTTP ${uploadRes.status}).`);
      }

      uploadedEntries.push({
        objectKey: uploadInfo.objectKey,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      });
    }

    return uploadedEntries;
  };

  const handleSubmit = async () => {
    setError('');

    // Build one payload for the order itself and another for optional item ratings.
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

    const hasOrderImages = orderReviewImages.length > 0;
    const hasItemImages = Object.values(itemReviewImages).some((files) => (files || []).length > 0);
    const hasAnyImages = hasOrderImages || hasItemImages;

    setIsSubmitting(true);
    try {
      if (hasAnyImages) {
        setUploadStatus('Uploading images...');
      }

      let orderImageEntries = [];
      if (hasOrderImages) {
        orderImageEntries = await uploadImagesAndCollectEntries(orderReviewImages);
      }

      const itemImageEntriesById = {};
      for (const [itemId, files] of Object.entries(itemReviewImages)) {
        if (!files || files.length === 0) {
          continue;
        }

        itemImageEntriesById[itemId] = await uploadImagesAndCollectEntries(files);
      }

      // imageKeys carries { objectKey, fileName, contentType } so the backend
      // stores the real file name and MIME type instead of guessing from the UUID S3 key.
      const orderReviewPayload = payloadOrderReview
        ? {
            ...payloadOrderReview,
            imageKeys: orderImageEntries,
          }
        : null;

      const itemReviewPayloads = payloadItemReviews.map((itemReview) => ({
        ...itemReview,
        imageKeys: itemImageEntriesById[String(itemReview.orderItemId)] || [],
      }));

      setUploadStatus('Submitting review...');

      let res;
      try {
        res = await submitCustomerReview(order.orderId, {
          orderReview: orderReviewPayload,
          itemReviews: itemReviewPayloads,
        });
      } catch {
        throw new Error('Could not connect to the server to submit your review. Please check your connection and try again.');
      }

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        onSuccess();
      } else {
        setError(json.message || 'Failed to submit review.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setUploadStatus('');
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

  const renderImageChips = (files, onRemove) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {files.map((file, index) => (
        <span
          key={`${file.name}-${file.size}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 pl-3 pr-1.5 py-1 text-xs font-medium text-orange-700"
        >
          {file.name}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded-full p-0.5 text-orange-400 transition-colors hover:bg-orange-100 hover:text-orange-600"
          >
            <Trash2 size={12} />
          </button>
        </span>
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
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Add Photos <span className="font-normal normal-case text-slate-400">({orderReviewImages.length}/{MAX_IMAGES_PER_REVIEW})</span>
                </p>
                <button
                  type="button"
                  onClick={() => orderImageInputRef.current?.click()}
                  disabled={orderReviewImages.length >= MAX_IMAGES_PER_REVIEW}
                  className="rounded-full border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Choose Images
                </button>
              </div>
              <input
                ref={orderImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleOrderReviewImagesChange}
                className="hidden"
              />
              {orderReviewImages.length > 0 && renderImageChips(orderReviewImages, removeOrderImage)}
            </div>
          </div>

          <hr className="mb-6 border-slate-100" />

          <div>
            <h3 className="mb-1 font-bold text-slate-800">Rate the Items</h3>
            <p className="mb-4 text-xs text-slate-500">You can optionally rate specific items from your order.</p>

            <div className="space-y-6">
              {order.items?.map((item) => {
                const itemRev = itemReviews[item.orderItemId] || { rating: 0, comment: '' };
                const isAlreadyReviewed = item.isReviewed;
                const currentItemImages = itemReviewImages[item.orderItemId] || [];

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
                    {itemRev.rating > 0 && (
                      <div className="mt-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                            Item Photos <span className="font-normal normal-case text-slate-400">({currentItemImages.length}/{MAX_IMAGES_PER_REVIEW})</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => itemImageInputRefs.current[item.orderItemId]?.click()}
                            disabled={currentItemImages.length >= MAX_IMAGES_PER_REVIEW}
                            className="rounded-full border border-orange-200 px-3 py-1 text-[0.7rem] font-bold text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Choose Images
                          </button>
                        </div>
                        <input
                          ref={(node) => {
                            if (node) {
                              itemImageInputRefs.current[item.orderItemId] = node;
                            }
                          }}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          onChange={(event) => handleItemReviewImagesChange(item.orderItemId, event)}
                          className="hidden"
                        />
                        {currentItemImages.length > 0 && renderImageChips(currentItemImages, (idx) => removeItemImage(item.orderItemId, idx))}
                      </div>
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
        {uploadStatus && (
          <div className="border-t border-slate-100 px-5 pb-4 text-xs font-medium text-slate-500">
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
}