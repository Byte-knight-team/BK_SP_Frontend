import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserCircle2, Menu, X, Package, LogOut, DoorOpen } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getQrSessionClaims } from '../../utils/authToken';
import { endQrSession } from '../../apis/customer/qrSessions';
import BrandLogo from './BrandLogo';
import LoginButton from './LoginCustomer';
import SignupButton from './SignupCustomer';
import Button from './buttons/Button';
import IconButton from './buttons/IconButton';
import LinkButton from './buttons/LinkButton';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getQrSessionClaim(claimName) {
  // Decode claim on-the-fly from token, never read from localStorage
  const qrSessionToken = localStorage.getItem('qr_session_token');
  if (!qrSessionToken) return null;
  const claims = getQrSessionClaims(qrSessionToken);
  return claims?.[claimName] || null;
}

export default function Navbar() {
  // 1. Grab clearCart from the context!
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
    profilePic: ''
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
      profilePic: localStorage.getItem('customer_profile_pic') || ''
    });
    setIsMenuOpen(false);

    return () => window.removeEventListener('profile_picture_updated', handleProfileUpdate);
  }, [location.pathname]);

  // 2. Add clearCart() to the logout sequence
  const handleLogout = () => {
    localStorage.removeItem('customer_jwt');
    localStorage.removeItem('customer_role');
    localStorage.removeItem('customer_user_id');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_profile_pic');

    //log outs qr session for more security
    localStorage.removeItem('qr_session');
    localStorage.removeItem('qr_session_token');
    localStorage.removeItem('qr_branch_id');
    localStorage.removeItem('qr_table_id');

    // Wipe the cart memory!
    clearCart();

    setAuth({ isLoggedIn: false, isQrCustomer: auth.isQrCustomer, userName: '', profilePic: '' });
    navigate('/');
  };

  // ── Leave Table: end QR session (backend + frontend), wipe everything ──
  const handleLeaveTable = async () => {
    const sessionId = getQrSessionClaim('session_id');

    // Call backend to formally end the session (fire-and-forget, don't block on failure)
    if (sessionId) {
      try {
        await endQrSession(sessionId);
      } catch {
        // Silent — we still clear frontend regardless
      }
    }

    // Clear everything — both QR session AND customer auth
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
    setAuth({ isLoggedIn: false, isQrCustomer: false, userName: '', profilePic: '' });
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

    //f they are NOT logged in, intercept them:
    if (!token) {
      if (qrSessionToken) {
        // Force OTP verify to link this new QR session to their old account
        navigate('/signup/qr?redirect=/orders', { replace: true });
      } else {
        navigate('/login?redirect=/orders', { replace: true });
      }
      return;
    }
    //If they ARE logged in, put your normal button logic here:
    navigate('/orders');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandLogo />
          <div className="leading-tight min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">
              <span className="text-orange-500">Crave</span>House
            </p>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Premium Dining Experience
            </p>
          </div>
        </Link>

        {isHomePage && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
            <a
              href="#restuarent"
              className="transition-colors hover:text-slate-900"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="transition-colors hover:text-slate-900"
            >
              Testimonials
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            {/* ───── GUEST VIEW ───── */}
            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}

            {/* ───── LOGGED IN VIEW ───── */}
            {auth.isLoggedIn && (
              <>
                <LinkButton
                  to="/orders"
                  variant="secondary"
                  icon={Package}
                >
                  Orders
                </LinkButton>

                {/* ONLY SHOW ACCOUNT IF NOT A QR CUSTOMER */}
                {!auth.isQrCustomer && (
                  <LinkButton
                    to="/account"
                    variant="secondary"
                    icon={auth.profilePic ? null : UserCircle2}
                  >
                    <span className="flex items-center">
                      {auth.profilePic && (
                        <img 
                          src={auth.profilePic} 
                          alt="Profile" 
                          className="w-5 h-5 rounded-full object-cover -ml-1 mr-1.5" 
                        />
                      )}
                      <span className="max-w-[100px] truncate leading-none pt-0.5">
                        {auth.userName || "Account"}
                      </span>
                    </span>
                  </LinkButton>
                )}

                {/* LEAVE TABLE for QR + logged-in users */}
                {auth.isQrCustomer ? (
                  <Button
                    onClick={handleLeaveTable}
                    variant="accent"
                    icon={DoorOpen}
                    title="Leave Table"
                  >
                    Leave Table
                  </Button>
                ) : (
                  <Button
                    onClick={handleLogout}
                    variant="danger"
                    icon={LogOut}
                    title="Logout"
                  >
                    Logout
                  </Button>
                )}
              </>
            )}

            {/* ───── QR CUSTOMER VIEW (not logged in) ───── */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <>
                <Button
                  onClick={handleTableOrderClick}
                  variant="secondary"
                  icon={Package}
                >
                  Table Orders
                </Button>
                <Button
                  onClick={handleLeaveTable}
                  variant="accent"
                  icon={DoorOpen}
                  title="Leave Table"
                >
                  Leave Table
                </Button>
              </>
            )}
          </div>

          <Link
            to="/cart"
            className="relative ml-2"
            aria-label="Open cart"
          >
            <IconButton icon={ShoppingBag} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={toggleMenu}
            className="inline-flex xl:hidden ml-2"
            icon={isMenuOpen ? X : Menu}
          />

          {!isMenuPage && (
            <LinkButton
              to="/menu"
              variant="secondary"
              className="hidden ml-2 sm:inline-flex"
            >
              Menu
            </LinkButton>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white shadow-lg xl:hidden">
          <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl space-y-2 overflow-y-auto px-4 py-4">
            {isHomePage && (
              <>
                <a
                  href="#restuarent"
                  onClick={toggleMenu}
                  className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  onClick={toggleMenu}
                  className="block rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Testimonials
                </a>
                <div className="h-px bg-slate-200 my-3" />
              </>
            )}

            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <>
                <LinkButton
                  to="/login"
                  onClick={toggleMenu}
                  variant="secondary"
                  className="w-full justify-start"
                >
                  Login
                </LinkButton>
                <LinkButton
                  to="/signup"
                  onClick={toggleMenu}
                  variant="primary"
                  className="w-full justify-start"
                >
                  Sign Up
                </LinkButton>
              </>
            )}

            {auth.isLoggedIn && (
              <>
                <LinkButton
                  to="/orders"
                  onClick={toggleMenu}
                  variant="secondary"
                  icon={Package}
                  className="w-full justify-start"
                >
                  Orders
                </LinkButton>
                <LinkButton
                  to="/account"
                  onClick={toggleMenu}
                  variant="secondary"
                  icon={auth.profilePic ? null : UserCircle2}
                  className="w-full justify-start"
                >
                  <span className="flex items-center">
                    {auth.profilePic && (
                      <img 
                        src={auth.profilePic} 
                        alt="Profile" 
                        className="w-5 h-5 rounded-full object-cover mr-1.5" 
                      />
                    )}
                    <span className="truncate leading-none pt-0.5">
                      {auth.userName || "Account"}
                    </span>
                  </span>
                </LinkButton>
                {auth.isQrCustomer ? (
                  <Button
                    onClick={() => { handleLeaveTable(); toggleMenu(); }}
                    variant="accent"
                    icon={DoorOpen}
                    className="w-full justify-start"
                  >
                    Leave Table
                  </Button>
                ) : (
                  <Button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    variant="danger"
                    icon={LogOut}
                    className="w-full justify-start"
                  >
                    Logout
                  </Button>
                )}
              </>
            )}

            {/* Mobile: QR customer not logged in */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <>
                <Button
                  onClick={() => { handleTableOrderClick(); toggleMenu(); }}
                  variant="secondary"
                  icon={Package}
                  className="w-full justify-start"
                >
                  Table Orders
                </Button>
                <Button
                  onClick={() => { handleLeaveTable(); toggleMenu(); }}
                  variant="accent"
                  icon={DoorOpen}
                  className="w-full justify-start"
                >
                  Leave Table
                </Button>
              </>
            )}

            {!isMenuPage && (
              <>
                <div className="h-px bg-slate-200 my-3" />
                <LinkButton
                  to="/menu"
                  onClick={toggleMenu}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Open Menu
                </LinkButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}