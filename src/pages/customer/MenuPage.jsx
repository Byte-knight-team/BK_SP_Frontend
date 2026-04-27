import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/customer/Navbar';
import { getQrSessionClaims } from '../../utils/authToken';
import menuCover from '../../assets/menu cover image.avif';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  Award,
  Leaf,
  ChefHat,
  ShoppingCart,
  Search
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getBranchId() {
  // Decode branchId from QR session token on-the-fly, never store decoded IDs
  const qrSessionToken = localStorage.getItem('qr_session_token');
  if (qrSessionToken) {
    const claims = getQrSessionClaims(qrSessionToken);
    if (claims?.branch_id && Number.isFinite(claims.branch_id) && claims.branch_id > 0) {
      return claims.branch_id;
    }
  }
  return 1; // Default branch
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      setIsLoading(true);
      setError('');

      try {
        const branchId = getBranchId();
        const res = await fetch(`${API_BASE}/api/v1/menu/customer?branchId=${branchId}`);
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload?.message || 'Unable to load menu items.');
        }

        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (isMounted) {
          setMenuItems(
            items.map((item) => ({
              ...item,
              image: item.imageUrl,
              price: Number(item.price),
            }))
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load menu items.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedCategories = useMemo(() => {
    const filteredItems = menuItems.filter((item) => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    });

    return filteredItems.reduce((accumulator, item) => {
      const categoryKey = item.categoryName || 'Uncategorized';
      const subCategoryKey = item.subCategory || 'General';

      if (!accumulator[categoryKey]) {
        accumulator[categoryKey] = {};
      }

      if (!accumulator[categoryKey][subCategoryKey]) {
        accumulator[categoryKey][subCategoryKey] = [];
      }

      accumulator[categoryKey][subCategoryKey].push(item);
      return accumulator;
    }, {});
  }, [menuItems, searchQuery]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const renderMenuCard = (item) => (
    <div
      className="flex border border-gray-200 rounded-[14px] overflow-hidden bg-white transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 max-[480px]:flex-col"
      key={item.id}
    >
      <div className="relative w-[160px] min-h-[190px] shrink-0 max-md:w-[120px] max-md:min-h-[140px] max-[480px]:w-full max-[480px]:min-h-[180px]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <button
          className={`absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/90 backdrop-blur-[4px] flex items-center justify-center border-none transition-all duration-300 ${favorites.includes(item.id) ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-500`}
          onClick={() => toggleFavorite(item.id)}
        >
          <Heart
            size={16}
            fill={favorites.includes(item.id) ? '#f97316' : 'none'}
            className={favorites.includes(item.id) ? 'text-orange-500' : ''}
          />
        </button>
      </div>

      <div className="flex-1 p-4 px-[18px] flex flex-col min-w-0">
        <div className="mb-1 flex flex-wrap gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-500">
          <span>{item.categoryName || 'Uncategorized'}</span>
          {item.subCategory && item.subCategory !== 'General' && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-600">
              {item.subCategory}
            </span>
          )}
        </div>
        <h3 className="font-heading text-base font-bold text-navy mb-[5px]">
          {item.name}
        </h3>
        <p className="text-[0.78rem] text-gray-500 leading-relaxed mb-2.5 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-3 text-[0.75rem] text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-[3px] font-semibold text-gray-800">
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
              
          </span>
          <span className="flex items-center gap-[3px]">
            <Clock size={14} /> ~{item.preparationTime} min
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 max-[420px]:flex-col max-[420px]:items-stretch">
          <span className="font-heading text-[1.1rem] font-bold text-navy">
            LKR {Number(item.price || 0).toLocaleString()}
          </span>
          <button
            className="inline-flex min-w-[118px] items-center justify-center gap-1.5 rounded-lg border border-orange-600 bg-orange-500 px-4 py-2.5 text-[0.82rem] font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-orange-600 max-[420px]:w-full"
            onClick={() => addToCart(item)}
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative mx-auto mb-5 mt-4 w-full max-w-5xl px-3 sm:px-6">
        <button
          className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 sm:left-6"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="mx-auto w-full max-w-2xl pl-14 sm:pl-16">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[14px] border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-[0.9rem] text-slate-800 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold tracking-wider text-gray-400 hover:text-orange-500"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {!searchQuery && (
        <section
          className="relative mx-4 flex h-[220px] items-end overflow-hidden rounded-[16px] bg-cover bg-center sm:mx-6 sm:h-[280px]"
          style={{ backgroundImage: `url(${menuCover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/15" />
          <div className="relative z-[1] p-5 text-white sm:p-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-[8px] text-[0.7rem] font-semibold tracking-[0.5px] uppercase text-white mb-3">
              <ChefHat size={14} /> CURATED BY Professionals
            </span>
            <h1 className="mb-2.5 font-heading text-[1.6rem] font-extrabold leading-[1.1] sm:text-[2.5rem]">
              Culinary Excellence
            </h1>
            <p className="max-w-[540px] text-[0.82rem] leading-relaxed opacity-[0.88] sm:text-[0.9rem]">
              Experience the finest flavors crafted with passion, premium
              ingredients, and decades of culinary expertise
            </p>
          </div>
        </section>
      )}

      {/* ───── Menu Grid ───── */}
      <section className="px-6 pt-7 pb-9 max-md:px-4 max-md:py-5">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-[1.6rem] font-bold text-slate-800 mb-1">
              {searchQuery ? "Search Results" : "Our Menu"}
            </h2>
            <p className="text-[0.875rem] text-gray-500">
              {searchQuery
                ? `Found ${
                    Object.values(groupedCategories)
                      .flatMap((sub) => Object.values(sub))
                      .flat().length
                  } matches`
                : `${menuItems.length} handcrafted dishes`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-[14px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-500">
            Loading menu items...
          </div>
        ) : error ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-6 py-14 text-center text-red-700">
            {error}
          </div>
        ) : Object.keys(groupedCategories).length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="mb-1 font-heading text-lg font-semibold text-slate-800">
              No matching items found
            </h3>
            <p className="text-sm text-gray-500">
              We couldn't find anything matching "{searchQuery}". Try a
              different term.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCategories).map(
              ([categoryName, subCategories]) => (
                <div key={categoryName} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="font-heading text-[1.15rem] font-bold text-slate-800">
                      {categoryName}
                    </h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {Object.values(subCategories).flat().length} items
                    </span>
                  </div>

                  <div className="space-y-5">
                    {Object.entries(subCategories).map(
                      ([subCategoryName, items]) => (
                        <div
                          key={`${categoryName}-${subCategoryName}`}
                          className="space-y-3"
                        >
                          {subCategoryName !== "General" && (
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading text-[1rem] font-semibold text-slate-600">
                                {subCategoryName}
                              </h4>
                              <span className="text-xs uppercase tracking-wide text-gray-400">
                                {items.length} items
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                            {items.map(renderMenuCard)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ───── Bottom Trust Bar ───── */}
      <div className="flex justify-center gap-9 px-6 py-6 border-t border-gray-200 flex-wrap max-md:gap-4 max-md:p-4">
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <Award size={16} color="#FF6B35" /> Michelin Recommended
        </span>
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <Star size={16} fill="#F59E0B" color="#F59E0B" /> Higher Ratings
        </span>
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <Leaf size={16} color="#22C55E" /> Organic Ingredients
        </span>
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <ChefHat size={16} color="#FF6B35" /> Expert Chefs
        </span>
      </div>
    </div>
  );
}