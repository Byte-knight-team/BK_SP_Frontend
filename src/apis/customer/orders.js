import { customerAuthFetch } from '../apiHelper';

/**
 * Fetch paginated customer orders from backend
 * { active, type, page, size }
 * { data: { orders: [...], page, size, totalElements, totalPages, last } }
 */
export const listCustomerOrders = async ({ active, type, page = 0, size = 10 }) => {
  const params = new URLSearchParams({ active: String(active), page: String(page), size: String(size) });

  if (type && type !== 'ALL') {
    params.set('type', type);
  }

  return customerAuthFetch(`/api/v1/orders?${params.toString()}`);
};

export const getCustomerOrder = async (orderId) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}`);
};

export const cancelCustomerOrder = async (orderId, cancellationReason) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ cancellationReason }),
  });
};

/**
 * Submit a review (with ratings, comments, and S3 image keys) for a completed order.
 * imageKeys inside the payload must be the object keys returned by createCustomerReviewImagePresignUrls.
 */
export const submitCustomerReview = async (orderId, payload) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Ask the backend to generate presigned S3 PUT URLs for the given files.
 * Returns one { uploadUrl, objectKey, fileName, contentType, expiresInSeconds } per file.
 * Call this before uploading — the actual binary upload goes directly to S3.
 */
export const createCustomerReviewImagePresignUrls = async (files) => {
  return customerAuthFetch('/api/v1/reviews/images/presign', {
    method: 'POST',
    body: JSON.stringify({ files }),
  });
};

/**
 * Upload a single file directly to S3 using a presigned PUT URL.
 * Does NOT go through the backend - credentials are embedded in the URL by the backend.
 * No Authorization header is added; using customerAuthFetch here would break the S3 request.
 */
export const uploadFileToPresignedUrl = async (uploadUrl, file) => {
  return fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
};