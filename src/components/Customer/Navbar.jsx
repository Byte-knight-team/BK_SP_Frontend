import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, UserCircle2, ChevronRight, Menu, X, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import BrandLogo from './BrandLogo'
import LoginButton from './LoginCustomer'
import SignupButton from './SignupCustomer'

export default function Navbar() {
	const { cartCount } = useCart();
	const location = useLocation();
	const isMenuPage = location.pathname === '/menu';
	const isHomePage = location.pathname === '/';
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen(prev => !prev);

	useEffect(() => {
		setIsMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!isMenuOpen) {
			document.body.style.overflow = '';
			return;
		}

		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isMenuOpen]);

	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
				<Link to="/" className="flex items-center gap-2.5">
					<BrandLogo />
					<div className="leading-tight min-w-0">
						<p className="text-sm font-bold text-slate-900 sm:text-base truncate">Crave House</p>
						<p className="hidden text-[11px] text-slate-500 sm:block">Premium Dining Experience</p>
					</div>
				</Link>

				{isHomePage && <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
					<a href="#restuarent" className="transition-colors hover:text-slate-900">How It Works</a>
					<a href="#testimonials" className="transition-colors hover:text-slate-900">Testimonials</a>
				</nav>}

				<div className="flex items-center gap-2">
				<div className="hidden items-center gap-2 xl:flex">
					<LoginButton />
					<SignupButton />
					<Link to="/orders" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
						<Package size={18} />
						<span>Orders</span>
						<ChevronRight size={15} />
					</Link>
						<Link to="/account" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
							<UserCircle2 size={18} />
							<span>Account</span>
							<ChevronRight size={15} />
						</Link>
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
						className="inline-flex xl:hidden items-center justify-center h-10 w-10 rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
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
				<div className="absolute left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white shadow-lg xl:hidden">
					<div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl space-y-2 overflow-y-auto px-4 py-4">
						{/* Navigation Links */}
						{isHomePage && (
							<>
								<a
									href="#restuarent"
									onClick={toggleMenu}
									className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100"
								>
									How It Works
								</a>
								<a
									href="#testimonials"
									onClick={toggleMenu}
									className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100"
								>
									Testimonials
								</a>
							</>
						)}

						<Link
							to="/orders"
							onClick={toggleMenu}
							className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100"
						>
							<Package size={18} /> Orders
						</Link>
						<Link
							to="/account"
							onClick={toggleMenu}
							className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100"
						>
							<UserCircle2 size={18} /> Account
						</Link>

						{!isMenuPage && (
							<Link
								to="/menu"
								onClick={toggleMenu}
								className="block rounded-lg bg-slate-900 px-4 py-2.5 text-center font-semibold text-white transition-colors hover:bg-slate-800"
							>
								Open Menu
							</Link>
						)}

						<div className="h-px bg-slate-200 my-3" />

						{/* Auth Buttons */}
						<Link to="/login" onClick={toggleMenu} className="block w-full text-left px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors">
							Login
						</Link>
						<Link to="/signup" onClick={toggleMenu} className="block w-full text-left px-4 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">
							Sign Up
						</Link>
						<div className="h-px bg-slate-200 my-3" />
					</div>
				</div>
			)}
		</header>
	);
}
