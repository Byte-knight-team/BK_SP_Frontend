import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import qrLogo from '../assets/QR Logo.png';

export default function HeroSection() {
	return (
		<section className="relative isolate overflow-hidden">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2200&q=80)' }}
			/>
			<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/45" />

			<div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
				<div className="text-white">
					<h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
						Elevate Your
						<br />
						<span className="text-orange-400">Dining</span>
						<br />
						<span className="text-orange-400">Experience</span>
					</h1>
					<p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200">
						Experience seamless QR ordering, real-time tracking, and exclusive rewards from
						dine-in to delivery.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link
							to="/menu"
							className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
						>
							Start Ordering
							<ArrowRight size={18} />
						</Link>
					</div>

					<div className="mt-8 grid max-w-md grid-cols-3 gap-3">
						{[
							{ value: '4.9', label: 'App Rating' },
							{ value: '50K+', label: 'Orders' },
							{ value: '24/7', label: 'Support' },
						].map((stat) => (
							<div key={stat.label} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
								<p className="text-xl font-bold text-white">{stat.value}</p>
								<p className="text-xs text-slate-300">{stat.label}</p>
							</div>
						))}
					</div>
				</div>

				<div className="relative mx-auto hidden w-full max-w-xl lg:block">
					<div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
						<img
							src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
							alt="Premium plated food"
							className="h-[360px] w-full rounded-2xl object-cover"
						/>
					</div>

					<div className="absolute -left-10 top-10 rounded-2xl bg-white p-3 shadow-xl">
						<div className="rounded-xl bg-orange-500 p-2">
							<img src={qrLogo} alt="QR ordering" className="h-11 w-11 rounded-lg object-contain" />
						</div>
						<p className="mt-2 text-xs font-semibold text-slate-700">Scan & order</p>
					</div>
				</div>
			</div>
		</section>
	);
}
