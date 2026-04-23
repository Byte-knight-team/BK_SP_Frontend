import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserCircle2, ChevronRight, Menu, X, Package, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import BrandLogo from './BrandLogo';
import LoginButton from './LoginCustomer';
import SignupButton from './SignupCustomer';

export default function Navbar() {
    const { cartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    
    const isMenuPage = location.pathname === '/menu';
    const isHomePage = location.pathname === '/';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 1. The Memory State for Auth
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        isQrCustomer: false,
        userName: ''
    });

    // 2. Check who the user is every time the URL changes
    useEffect(() => {
        setAuth({
            isLoggedIn: Boolean(localStorage.getItem('customer_jwt')),
            isQrCustomer: Boolean(localStorage.getItem('qr_session_token')),
            userName: localStorage.getItem('customer_name') || ''
        });
        setIsMenuOpen(false); // Close mobile menu on page change
    }, [location.pathname]);

    // 3. Logout Function
    const handleLogout = () => {
        localStorage.removeItem('customer_jwt');
        localStorage.removeItem('customer_user_id');
        localStorage.removeItem('customer_name');
        // Force state update and redirect
        setAuth({ isLoggedIn: false, isQrCustomer: auth.isQrCustomer, userName: '' });
        navigate('/'); 
    };

    const toggleMenu = () => setIsMenuOpen(prev => !prev);

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

                {isHomePage && (
                    <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
                        <a href="#restuarent" className="transition-colors hover:text-slate-900">How It Works</a>
                        <a href="#testimonials" className="transition-colors hover:text-slate-900">Testimonials</a>
                    </nav>
                )}

                <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 xl:flex">
                        
                        {/* ───── GUEST VIEW (Not Logged In & Not QR) ───── */}
                        {!auth.isLoggedIn && !auth.isQrCustomer && (
                            <>
                                <LoginButton />
                                <SignupButton />
                            </>
                        )}

                        {/* ───── LOGGED IN VIEW (Online Customer) ───── */}
                        {auth.isLoggedIn && (
                            <>
                                <Link to="/orders" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
                                    <Package size={18} />
                                    <span>Orders</span>
                                </Link>
                                <Link to="/account" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
                                    <UserCircle2 size={18} />
                                    <span className="max-w-[100px] truncate">{auth.userName || 'Account'}</span>
                                </Link>
                                <button onClick={handleLogout} className="inline-flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </>
                        )}

                        {/* ───── QR CUSTOMER VIEW (At Table) ───── */}
                        {auth.isQrCustomer && !auth.isLoggedIn && (
                            <Link to="/orders" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
                                <Package size={18} />
                                <span>Table Orders</span>
                            </Link>
                            // Notice: No Login/Signup or Account buttons here!
                        )}
                    </div>

                    <Link
                        to="/cart"
                        className="relative ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-orange-400 hover:text-orange-600"
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
                        className="inline-flex xl:hidden ml-2 items-center justify-center h-10 w-10 rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {!isMenuPage && (
                        <Link to="/menu" className="hidden ml-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:inline-flex">
                            Menu
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {isMenuOpen && (
                <div className="absolute left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white shadow-lg xl:hidden">
                    <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl space-y-2 overflow-y-auto px-4 py-4">
                        
                        {isHomePage && (
                            <>
                                <a href="#restuarent" onClick={toggleMenu} className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100">How It Works</a>
                                <a href="#testimonials" onClick={toggleMenu} className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100">Testimonials</a>
                                <div className="h-px bg-slate-200 my-3" />
                            </>
                        )}

                        {/* Mobile GUEST */}
                        {!auth.isLoggedIn && !auth.isQrCustomer && (
                            <>
                                <Link to="/login" onClick={toggleMenu} className="block w-full text-left px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50">Login</Link>
                                <Link to="/signup" onClick={toggleMenu} className="block w-full text-left px-4 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600">Sign Up</Link>
                            </>
                        )}

                        {/* Mobile LOGGED IN */}
                        {auth.isLoggedIn && (
                            <>
                                <Link to="/orders" onClick={toggleMenu} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
                                    <Package size={18} /> Orders
                                </Link>
                                <Link to="/account" onClick={toggleMenu} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
                                    <UserCircle2 size={18} /> {auth.userName || 'Account'}
                                </Link>
                                <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-red-600 hover:bg-red-50">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        )}

                        {/* Mobile QR CUSTOMER */}
                        {auth.isQrCustomer && !auth.isLoggedIn && (
                            <Link to="/orders" onClick={toggleMenu} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
                                <Package size={18} /> Table Orders
                            </Link>
                        )}

                        {!isMenuPage && (
                            <>
                                <div className="h-px bg-slate-200 my-3" />
                                <Link to="/menu" onClick={toggleMenu} className="block rounded-lg bg-slate-900 px-4 py-2.5 text-center font-semibold text-white hover:bg-slate-800">
                                    Open Menu
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}