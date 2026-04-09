import { Link } from 'react-router-dom';
import { ShoppingBag, UserCircle2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import brandLogo from '../assets/Crave House logo.png';

export default function Navbar() {
	const { cartCount } = useCart();

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link to="/" className="flex items-center gap-2.5">
					<img src={brandLogo} alt="Crave House" className="h-11 w-11 shrink-0 rounded-xl object-contain" />
					<div className="leading-tight">
						<p className="text-sm font-bold text-slate-900 sm:text-base">Crave House</p>
						<p className="hidden text-[11px] text-slate-500 sm:block">Premium Dining Experience</p>
					</div>
				</Link>

				<nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
					<a href="#features" className="transition-colors hover:text-slate-900">Features</a>
					<a href="#steps" className="transition-colors hover:text-slate-900">How It Works</a>
					<a href="#testimonials" className="transition-colors hover:text-slate-900">Testimonials</a>
					<a href="#experience" className="transition-colors hover:text-slate-900">Get Started</a>
				</nav>

				<div className="flex items-center gap-2.5">
					<div className="hidden items-center gap-2 md:flex">
						<button className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
							Login
						</button>
						<button className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
							Sign Up
						</button>
						<button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
							<UserCircle2 size={18} />
							<span>Account</span>
							<ChevronRight size={15} />
						</button>
					</div>
					<Link
						to="/cart"
						className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-orange-400 hover:text-orange-600"
						aria-label="Open cart"
					>
						<ShoppingBag size={18} />
						{cartCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
								{cartCount}
							</span>
						)}
					</Link>
					<Link to="/menu" className="hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:inline-flex">
						Menu
					</Link>
				</div>
			</div>
		</header>
	);
}
