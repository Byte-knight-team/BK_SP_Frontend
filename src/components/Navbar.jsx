import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, UserCircle2, ChevronRight, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BrandLogo from '../components/BrandLogo'
import LoginButton from '../components/LoginCustomer'
import SignupButton from '../components/SignupCustomer'

export default function Navbar() {
	const { cartCount } = useCart();
	const location = useLocation();
	const isMenuPage = location.pathname === '/menu';
	const isHomePage = location.pathname === '/';
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen(prev => !prev);

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link to="/" className="flex items-center gap-2.5">
					<BrandLogo />
					<div className="leading-tight">
						<p className="text-sm font-bold text-slate-900 sm:text-base">Crave House</p>
						<p className="hidden text-[11px] text-slate-500 sm:block">Premium Dining Experience</p>
					</div>
				</Link>

				{isHomePage && <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
					<a href="#restuarent" className="transition-colors hover:text-slate-900">How It Works</a>
					<a href="#testimonials" className="transition-colors hover:text-slate-900">Testimonials</a>
				</nav>}

				<div className="flex items-center gap-2.5">
					<div className="hidden items-center gap-2 md:flex">
						<LoginButton />
						<SignupButton />
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

					{/*Menu Button - visible only on mobile/tablet */}
					<button
						onClick={toggleMenu}
						className="inline-flex lg:hidden items-center justify-center h-10 w-10 rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
						aria-label="Toggle menu"
					>
						{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
					</button>

					{!isMenuPage && (
						<Link to="/menu" className="hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:inline-flex">
							Menu
						</Link>
					)}
				</div>
			</div>

			{/* Mobile Menu Panel */}
			{isMenuOpen && (
				<div className="absolute left-0 right-0 top-16 border-b border-slate-200 bg-white shadow-lg lg:hidden z-40">
					<div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
						{/* Navigation Links */}
						
					<a
						href="#online"
						onClick={toggleMenu}
						className="block px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
					>
						How It Works
					</a>
					<a
						href="#testimonials"
						onClick={toggleMenu}
						className="block px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
					>
						Testimonials
					</a>

						<div className="h-px bg-slate-200 my-3" />

						{/* Auth Buttons */}
						<Link to="/login" onClick={toggleMenu} className="block w-full text-left px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors">
							Login
						</Link>
						<button className="w-full text-left px-4 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">
							Sign Up
						</button>
						<button className="w-full text-left px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
							<UserCircle2 size={18} />
							<span>Account</span>
						</button>

						<div className="h-px bg-slate-200 my-3" />
					</div>
				</div>
			)}
		</header>
	);
}
