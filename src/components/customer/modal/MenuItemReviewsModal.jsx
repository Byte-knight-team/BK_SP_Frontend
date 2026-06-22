import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMenuItemReviews } from '../../../apis/customer/menu';

export default function MenuItemReviewsModal({ item, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchReviews = async (pageNumber) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);
      
      const res = await getMenuItemReviews(item.id, pageNumber, 10);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || 'Failed to fetch reviews');

      const responseData = data.data;
      if (pageNumber === 0) {
        setReviews(responseData.reviews || []);
        setSummary(responseData.summary || null);
      } else {
        setReviews((prev) => [...prev, ...(responseData.reviews || [])]);
      }
      
      setHasMore(responseData.hasMore || false);
      setPage(pageNumber);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (item?.id) {
      fetchReviews(0);
    }
  }, [item?.id]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(page + 1);
    }
  };

  const openLightbox = (images, startIndex) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  };

  const closeLightbox = () => {
    setLightboxImages([]);
  };

  const nextLightboxImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex < lightboxImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevLightboxImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-200'}
      />
    ));
  };

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Format date: "Jun 10, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-[24px] bg-white shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white shrink-0 z-10">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900">{item.name} Reviews</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 custom-scrollbar">
            {error && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-r-transparent mb-4"></div>
                <p className="text-sm font-medium text-slate-500">Loading reviews...</p>
              </div>
            ) : (
              <>
                {/* Summary Bar Chart Section */}
                {summary && summary.totalCount > 0 && (
                  <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-4xl font-black text-slate-900">{summary.averageRating.toFixed(1)}</div>
                      <div className="flex gap-0.5 mt-1">{renderStars(Math.round(summary.averageRating))}</div>
                      <div className="text-xs text-slate-500 mt-2 font-medium">{summary.totalCount} reviews</div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = summary.ratingBreakdown?.[star] || 0;
                        const percentage = summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0;
                        
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs">
                            <span className="w-4 font-bold text-slate-600">{star}</span>
                            <Star size={10} className="fill-slate-400 text-slate-400" />
                            <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full bg-orange-400 rounded-full"
                              />
                            </div>
                            <span className="w-6 text-right text-slate-500 font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                      <Star size={32} className="fill-current" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No reviews yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Be the first to review this item after ordering!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.reviewId} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                            {getInitials(review.customerName)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-slate-900 truncate pr-4">{review.customerName}</p>
                              <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(review.createdAt)}</span>
                            </div>
                            
                            <div className="flex gap-0.5 mb-2.5">
                              {renderStars(review.rating)}
                            </div>
                            
                            {review.comment && (
                              <p className="text-sm text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                                {review.comment}
                              </p>
                            )}
                            
                            {/* Images Strip */}
                            {review.images && review.images.length > 0 && (
                              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {review.images.map((img, idx) => (
                                  <button
                                    key={img.imageKey}
                                    onClick={() => openLightbox(review.images, idx)}
                                    className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 transition-opacity hover:opacity-80 cursor-zoom-in"
                                  >
                                    <img 
                                      src={img.imageUrl} 
                                      alt="Review photo" 
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hasMore && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-6 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                        >
                          {loadingMore ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-r-transparent"></div>
                              Loading...
                            </>
                          ) : (
                            'Load More Reviews'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-all"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>
            
            {/* Prev Button */}
            {lightboxImages.length > 1 && (
              <button 
                className={`absolute left-2 sm:left-6 p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all ${lightboxIndex === 0 ? 'text-white/20 cursor-not-allowed hover:bg-black/40' : 'text-white/80 hover:text-white'}`}
                onClick={prevLightboxImage}
                disabled={lightboxIndex === 0}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Main Image */}
            <motion.img
              key={lightboxImages[lightboxIndex].imageKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={lightboxImages[lightboxIndex].imageUrl}
              alt="Review full size"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {lightboxImages.length > 1 && (
              <button 
                className={`absolute right-2 sm:right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all ${lightboxIndex === lightboxImages.length - 1 ? 'text-white/20 cursor-not-allowed hover:bg-black/40' : 'text-white/80 hover:text-white'}`}
                onClick={nextLightboxImage}
                disabled={lightboxIndex === lightboxImages.length - 1}
              >
                <ChevronRight size={28} />
              </button>
            )}
            
            {/* Image Counter */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
