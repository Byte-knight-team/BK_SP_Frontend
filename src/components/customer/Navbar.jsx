import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserCircle2, Menu, X, Package, LogOut, DoorOpen, Calendar } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getQrSessionClaims } from '../../utils/authToken';
import { endQrSession } from '../../apis/customer/qrSessions';
import { showSignOutToast, showLeaveTableToast } from '../../utils/toast';
import BrandLogo from './BrandLogo';

function getQrSessionClaim(claimName) {
  // Decode claim on-the-fly from token, never read from localStorage
  const qrSessionToken = localStorage.getItem('qr_session_token');
  if (!qrSessionToken) return null;
  const claims = getQrSessionClaims(qrSessionToken);
  return claims?.[claimName] || null;
}

export default function Navbar() {
  const { cartCount, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isMenuPage = location.pathname === '/menu';
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    isQrCustomer: false,
    userName: '',
    profilePic: '',
    tableId: null,
    tableNumber: null
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      setAuth(prev => ({
        ...prev,
        profilePic: localStorage.getItem('customer_profile_pic') || ''
      }));
    };

    window.addEventListener('profile_picture_updated', handleProfileUpdate);

    setAuth({
      isLoggedIn: Boolean(localStorage.getItem('customer_jwt')),
      isQrCustomer: Boolean(localStorage.getItem('qr_session_token')),
      userName: localStorage.getItem('customer_name') || '',
      profilePic: localStorage.getItem('customer_profile_pic') || '',
      tableId: getQrSessionClaim('table_id'),
      tableNumber: getQrSessionClaim('table_number')
    });
    setIsMenuOpen(false);

    return () => window.removeEventListener('profile_picture_updated', handleProfileUpdate);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('customer_jwt');
    localStorage.removeItem('customer_role');
    localStorage.removeItem('customer_user_id');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_profile_pic');

    localStorage.removeItem('qr_session');
    localStorage.removeItem('qr_session_token');
    localStorage.removeItem('qr_branch_id');
    localStorage.removeItem('qr_table_id');

    clearCart();
    setAuth({ isLoggedIn: false, isQrCustomer: auth.isQrCustomer, userName: '', profilePic: '', tableId: auth.tableId });
    showSignOutToast();
    navigate('/');
  };

  const handleLeaveTable = async () => {
    const sessionId = getQrSessionClaim('session_id');

    if (sessionId) {
      try {
        await endQrSession(sessionId);
      } catch {
        // Silent
      }
    }

    localStorage.removeItem('qr_session');
    localStorage.removeItem('qr_session_token');
    localStorage.removeItem('qr_branch_id');
    localStorage.removeItem('qr_table_id');
    localStorage.removeItem('customer_jwt');
    localStorage.removeItem('customer_role');
    localStorage.removeItem('customer_user_id');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_profile_pic');

    clearCart();
    setAuth({ isLoggedIn: false, isQrCustomer: false, userName: '', profilePic: '', tableId: null });
    showLeaveTableToast();
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

  const handleTableOrderClick = () => {
    const token = localStorage.getItem('customer_jwt');
    const qrSessionToken = localStorage.getItem('qr_session_token');

    if (!token) {
      if (qrSessionToken) {
        navigate('/signup/qr?redirect=/orders', { replace: true });
      } else {
        navigate('/login?redirect=/orders', { replace: true });
      }
      return;
    }
    navigate('/orders');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        {/* ── Brand Logo Group ── */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-98">
            <BrandLogo />
            <div className="leading-tight min-w-0">
              <p className="text-lg font-bold text-slate-900 truncate flex items-center gap-2">
                <span><span className="text-orange-500">Crave</span>House</span>
              </p>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Premium Dining Experience
              </p>
            </div>
          </Link>

          {/* Table Badge for QR Customer */}
          {auth.isQrCustomer && auth.tableNumber && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-1.5 shadow-sm border border-orange-400/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
              </span>
              <span className="text-xs sm:text-sm font-extrabold tracking-wide drop-shadow-xs">Table {auth.tableNumber}</span>
            </div>
          )}
        </div>

        {/* ── Center Nav (Home Page) ── */}
        {isHomePage && (
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            <a
              href="#restuarent"
              className="px-3 py-1.5 rounded-lg transition-colors hover:text-orange-600 hover:bg-orange-50/60"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="px-3 py-1.5 rounded-lg transition-colors hover:text-orange-600 hover:bg-orange-50/60"
            >
              Testimonials
            </a>
          </nav>
        )}

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden items-center gap-2 xl:flex">
            {/* ───── GUEST VIEW ───── */}
            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <>
                <Link
                  to="/reservations"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 shadow-2xs group"
                >
                  <Calendar size={17} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
                  <span>Book a Table</span>
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 shadow-2xs"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* ───── LOGGED IN VIEW ───── */}
            {auth.isLoggedIn && (
              <>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 shadow-2xs group"
                >
                  <Package size={17} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
                  <span>Orders</span>
                </Link>

                {!auth.isQrCustomer && (
                  <Link
                    to="/reservations"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 shadow-2xs group"
                  >
                    <Calendar size={17} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
                    <span>Reservations</span>
                  </Link>
                )}

                {/* Account Profile Pill */}
                {!auth.isQrCustomer && (
                  <Link
                    to="/account"
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-100/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 text-slate-800 text-sm font-semibold transition-all shadow-2xs group"
                  >
                    {auth.profilePic ? (
                      <img
                        src={auth.profilePic}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                        {(auth.userName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate group-hover:text-orange-600">
                      {auth.userName || "Account"}
                    </span>
                  </Link>
                )}

                {/* Leave Table / Logout */}
                {auth.isQrCustomer ? (
                  <button
                    onClick={handleLeaveTable}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all active:scale-95 shadow-2xs group"
                    title="Leave Table"
                  >
                    <DoorOpen size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors" />
                    <span>Leave Table</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-100 transition-all active:scale-95"
                    title="Logout"
                  >
                    <LogOut size={16} />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                )}
              </>
            )}

            {/* ───── QR CUSTOMER VIEW (not logged in) ───── */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <>
                <button
                  onClick={handleTableOrderClick}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50/90 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 shadow-2xs group"
                >
                  <Package size={17} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={handleLeaveTable}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50/90 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 transition-all active:scale-95 shadow-2xs group"
                  title="Leave Table"
                >
                  <DoorOpen size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors" />
                  <span>Leave Table</span>
                </button>
              </>
            )}
          </div>

          {/* ── Menu Shortcut Link (when not on Menu page) ── */}
          {!isMenuPage && (
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 transition-all active:scale-95"
            >
              Menu
            </Link>
          )}

          {/* ── Cart Button ── */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/80 hover:border-orange-200 transition-all active:scale-95 shadow-2xs"
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ── Mobile Menu Toggle ── */}
          <button
            onClick={toggleMenu}
            className="inline-flex xl:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95 shadow-2xs"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Panel ── */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white/98 backdrop-blur-xl shadow-xl xl:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl space-y-2 overflow-y-auto px-4 py-5">
            {isHomePage && (
              <>
                <a
                  href="#restuarent"
                  onClick={toggleMenu}
                  className="block rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  onClick={toggleMenu}
                  className="block rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  Testimonials
                </a>
                <div className="h-px bg-slate-100 my-2" />
              </>
            )}

            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/reservations"
                  onClick={toggleMenu}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <Calendar size={18} className="text-slate-500" />
                  <span>Book a Table</span>
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={toggleMenu}
                    className="flex items-center justify-center rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 shadow-sm transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {auth.isLoggedIn && (
              <div className="flex flex-col gap-2">
                {!auth.isQrCustomer && (
                  <Link
                    to="/account"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80 p-3 mb-1"
                  >
                    {auth.profilePic ? (
                      <img
                        src={auth.profilePic}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-xs">
                        {(auth.userName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{auth.userName || "Customer"}</p>
                      <p className="text-xs text-orange-600 font-medium">View Account Profile</p>
                    </div>
                  </Link>
                )}

                <Link
                  to="/orders"
                  onClick={toggleMenu}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <Package size={18} className="text-slate-500" />
                  <span>Orders</span>
                </Link>

                {!auth.isQrCustomer && (
                  <Link
                    to="/reservations"
                    onClick={toggleMenu}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <Calendar size={18} className="text-slate-500" />
                    <span>Reservations</span>
                  </Link>
                )}

                {auth.isQrCustomer ? (
                  <button
                    onClick={() => { handleLeaveTable(); toggleMenu(); }}
                    className="flex items-center gap-2.5 w-full rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-2.5 font-semibold text-rose-600 hover:bg-rose-100 transition-colors mt-2"
                  >
                    <DoorOpen size={18} />
                    <span>Leave Table</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    className="flex items-center gap-2.5 w-full rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 font-semibold text-rose-600 hover:bg-rose-100 transition-colors mt-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile: QR customer not logged in */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { handleTableOrderClick(); toggleMenu(); }}
                  className="flex items-center gap-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Package size={18} />
                  <span>Table Orders</span>
                </button>
                <button
                  onClick={() => { handleLeaveTable(); toggleMenu(); }}
                  className="flex items-center gap-2.5 w-full rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-2.5 font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <DoorOpen size={18} />
                  <span>Leave Table</span>
                </button>
              </div>
            )}

            {!isMenuPage && (
              <>
                <div className="h-px bg-slate-100 my-2" />
                <Link
                  to="/menu"
                  onClick={toggleMenu}
                  className="flex items-center justify-center w-full rounded-xl bg-orange-500 py-3 font-bold text-white shadow-sm hover:bg-orange-600 transition-colors"
                >
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