/**
 * Fetch recent order reviews for landing page (public, no auth required)
 * @returns {Promise<Response>} { data: [{ reviewId, rating, comment, createdAt }, ...] }
 */
export const getRecentReviews = async () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return fetch(`${API_BASE}/api/v1/reviews/recent`);
};
