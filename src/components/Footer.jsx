import { Link } from 'react-router-dom';
import brandLogo from '../assets/Crave House logo.png';

export default function Footer() {
	return (
		<footer className="bg-slate-950 px-4 py-10 sm:px-6">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-3">
					<div>
						<div className="flex items-center gap-2.5">
							<img src={brandLogo} alt="Crave House" className="h-10 w-10 shrink-0 rounded-xl object-contain" />
							<p className="text-lg font-bold text-white">Crave House</p>
						</div>
						<p className="mt-2 text-sm text-slate-400">Premium Dining Experience</p>
						<p className="mt-4 max-w-sm text-sm text-slate-500">
							Good food, warm hearts, lasting memories
						</p>
					</div>

					<div>
						<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Quick Links</p>
						<div className="flex flex-col gap-2 text-sm text-slate-400">
							<a href="#features" className="transition-colors hover:text-orange-400">Features</a>
							<a href="#steps" className="transition-colors hover:text-orange-400">How It Works</a>
							<a href="#testimonials" className="transition-colors hover:text-orange-400">Testimonials</a>
							<Link to="/menu" className="transition-colors hover:text-orange-400">Get Started</Link>
						</div>
					</div>

					<div>
						<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Contact</p>
						<div className="space-y-2 text-sm text-slate-400">
							<p>support@cravehouse.com</p>
							<p>+94 75 228 78 30</p>
							<p>123 Restaurant St</p>
							<p>Flower Street, Colombo</p>
						</div>
					</div>
				</div>

				<div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
					<p>© 2026 Crave House. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
