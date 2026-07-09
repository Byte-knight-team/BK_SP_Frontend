import { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';
import { getRecentReviews } from '../../apis/customer/reviews';

export default function TestimonialsSection() {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const res = await getRecentReviews();
				const json = await res.json().catch(() => ({}));
				console.log('API Response:', { status: res.status, ok: res.ok, json });
				if (res.ok && Array.isArray(json?.data)) {
					setReviews(json.data);
				} else {
					console.warn('Unexpected response structure:', json);
					setReviews([]);
				}
			} catch (err) {
				console.error('Failed to fetch reviews:', err);
				setReviews([]);
			} finally {
				setLoading(false);
			}
		};

		fetchReviews();
	}, []);

	// Render stars based on rating
	const renderStars = (rating) => (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					size={18}
					className={`${star <= rating ? 'fill-amber-500 text-amber-500' : 'fill-slate-300 text-slate-300'}`}
				/>
			))}
		</div>
	);

	return (
		<section id="testimonials" className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<p className="inline-flex rounded-full border border-slate-600 bg-slate-700/30 px-3 py-1 text-xs font-semibold text-slate-200">Reviews</p>
					<h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Loved by Thousands</h2>
					<p className="mt-3 text-slate-300">See what our customers are saying about their experience</p>
				</div>

				{loading ? (
					<div className="flex items-center justify-center h-48">
						<Loader className="animate-spin text-orange-500" size={32} />
					</div>
				) : reviews.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-3">
						{reviews.map((review) => (
							<article key={review.reviewId} className="group rounded-2xl border border-slate-700 bg-slate-800/70 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] hover:border-slate-500 hover:bg-slate-800/90">
								<div className="mb-4 transition-transform duration-300 group-hover:scale-105 origin-left">
									{renderStars(review.rating)}
								</div>
								<p className="leading-relaxed text-slate-200 min-h-16">"{review.comment}"</p>
								<p className="text-sm text-slate-400">
									{new Date(review.createdAt).toLocaleDateString()}
								</p>
							</article>
						))}
					</div>
				) : (
					<div className="text-center text-slate-400 py-12">
						<p>share your experience!</p>
					</div>
				)}
			</div>
		</section>
	);
}
