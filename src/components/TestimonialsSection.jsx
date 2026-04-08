import { Star } from 'lucide-react';

const TESTIMONIALS = [
	{
		name: 'chamari perera.',
		role: 'Frequent diner',
		quote: 'Ordering is incredibly fast now. I can reorder my favorites in under a minute.',
	},
	{
		name: 'nilusha silva.',
		role: 'Restaurant owner',
		quote: 'Table turnover improved and our staff has fewer order mistakes during peak hours.',
	},
	{
		name: 'matheesha pathirana.',
		role: 'Delivery customer',
		quote: 'The live tracking is accurate, and the loyalty rewards keep me coming back.',
	},
];

export default function TestimonialsSection() {
	return (
		<section id="testimonials" className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<p className="inline-flex rounded-full border border-slate-600 bg-slate-700/30 px-3 py-1 text-xs font-semibold text-slate-200">Customer Reviews</p>
					<h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Loved by Thousands</h2>
					<p className="mt-3 text-slate-300">See what our customers are saying about their experience</p>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{TESTIMONIALS.map((item) => (
						<article key={item.name} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-7 backdrop-blur-sm">
							<div className="mb-4 flex gap-1 text-amber-500">
								<Star size={18} fill="currentColor" />
								<Star size={18} fill="currentColor" />
								<Star size={18} fill="currentColor" />
								<Star size={18} fill="currentColor" />
								<Star size={18} fill="currentColor" />
							</div>
							<p className="leading-relaxed text-slate-200">"{item.quote}"</p>
							<p className="mt-5 font-semibold text-white">{item.name}</p>
							<p className="text-sm text-slate-400">{item.role}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
