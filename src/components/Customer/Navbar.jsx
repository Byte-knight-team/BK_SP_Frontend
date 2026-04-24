// src/components/Customer/Navbar.jsx

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  UserCircle2,
  Menu,
  X,
  Package,
  LogOut,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import BrandLogo from "./BrandLogo";
import LoginButton from "./LoginCustomer";
import SignupButton from "./SignupCustomer";

export default function Navbar() {
  // Get cart count for the cart badge and clearCart for logout cleanup.
  const { cartCount, clearCart } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const isMenuPage = location.pathname === "/menu";
  const isHomePage = location.pathname === "/";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Customer auth state is read from localStorage.
  // customer_jwt = normal online customer login.
  // qr_session_token = QR/table customer session.
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    isQrCustomer: false,
    userName: "",
  });

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    // Refresh navbar state when route changes.
    setAuth({
      isLoggedIn: Boolean(localStorage.getItem("customer_jwt")),
      isQrCustomer: Boolean(localStorage.getItem("qr_session_token")),
      userName: localStorage.getItem("customer_name") || "",
    });

    // Close mobile menu after navigation.
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Remove normal customer login details.
    localStorage.removeItem("customer_jwt");
    localStorage.removeItem("customer_role");
    localStorage.removeItem("customer_user_id");
    localStorage.removeItem("customer_name");

    // Clear cart when customer logs out.
    clearCart();

    // Keep QR session status if a QR customer session still exists.
    setAuth({
      isLoggedIn: false,
      isQrCustomer: Boolean(localStorage.getItem("qr_session_token")),
      userName: "",
    });

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandLogo />

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
              Crave House
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
            {/* Guest customer view */}
            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}

            {/* Normal logged-in customer view */}
            {auth.isLoggedIn && (
              <>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                >
                  <Package size={18} />
                  <span>Orders</span>
                </Link>

                {!auth.isQrCustomer && (
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                  >
                    <UserCircle2 size={18} />
                    <span className="max-w-[100px] truncate">
                      {auth.userName || "Account"}
                    </span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}

            {/* QR/table customer view */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                <Package size={18} />
                <span>Table Orders</span>
              </Link>
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

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 xl:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!isMenuPage && (
            <Link
              to="/menu"
              className="ml-2 hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:inline-flex"
            >
              Menu
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
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

                <div className="my-3 h-px bg-slate-200" />
              </>
            )}

            {/* Guest customer mobile view */}
            {!auth.isLoggedIn && !auth.isQrCustomer && (
              <>
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-left font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={toggleMenu}
                  className="block w-full rounded-lg bg-orange-500 px-4 py-2.5 text-left font-semibold text-white hover:bg-orange-600"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Normal logged-in customer mobile view */}
            {auth.isLoggedIn && (
              <>
                <Link
                  to="/orders"
                  onClick={toggleMenu}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Package size={18} />
                  Orders
                </Link>

                {!auth.isQrCustomer && (
                  <Link
                    to="/account"
                    onClick={toggleMenu}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <UserCircle2 size={18} />
                    {auth.userName || "Account"}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}

            {/* QR/table customer mobile view */}
            {auth.isQrCustomer && !auth.isLoggedIn && (
              <Link
                to="/orders"
                onClick={toggleMenu}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
              >
                <Package size={18} />
                Table Orders
              </Link>
            )}

            {!isMenuPage && (
              <>
                <div className="my-3 h-px bg-slate-200" />

                <Link
                  to="/menu"
                  onClick={toggleMenu}
                  className="block rounded-lg bg-slate-900 px-4 py-2.5 text-center font-semibold text-white hover:bg-slate-800"
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