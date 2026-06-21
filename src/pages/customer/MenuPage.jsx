import { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/customer/Navbar';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import MenuItemReviewsModal from '../../components/customer/modal/MenuItemReviewsModal';
import { getQrSessionClaims } from '../../utils/authToken';
import { getCustomerMenu } from '../../apis/customer/menu';
import menuCover from '../../assets/menu cover image.avif';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  ShoppingCart,
  ChefHat,
  Search
} from 'lucide-react';

function getBranchId() {
  // Decode branchId from QR session token
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
  //const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForReviews, setSelectedItemForReviews] = useState(null);
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      setIsLoading(true);
      setError('');

      try {
        const branchId = getBranchId();
        const res = await getCustomerMenu(branchId);
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
              averageRating: item.averageRating ?? null,
              ratingCount: item.ratingCount ?? 0,
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

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const groupedCategories = useMemo(() => {
    const filteredItems = menuItems.filter((item) => {
      if (!deferredSearchQuery.trim()) return true;
      
      const query = deferredSearchQuery.toLowerCase();
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

  // const toggleFavorite = (id) => {
  //   setFavorites((prev) =>
  //     prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
  //   );
  // };

  const renderMenuCard = (item) => (
    <div
      className="flex flex-col sm:flex-row h-auto sm:h-[230px] overflow-hidden rounded-[18px] border border-slate-200 bg-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)]"
    >
      <div className="relative w-full sm:w-[140px] md:w-[180px] h-[200px] sm:h-full shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex-1 p-5 flex flex-col min-w-0">
        <div className="mb-2 flex flex-wrap gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-gray-500">
          <span>{item.categoryName || 'Uncategorized'}</span>
          {item.subCategory && item.subCategory !== 'General' && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-600">
              {item.subCategory}
            </span>
          )}
        </div>

        <h3 className="font-heading text-lg font-bold text-slate-900 mb-1 truncate">
          {item.name}
        </h3>
        <p className="text-[0.85rem] text-gray-600 leading-relaxed mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-4 text-[0.85rem] text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-2 font-medium text-gray-700">
            <Star size={16} fill={item.averageRating ? "#F59E0B" : "none"} />
            {item.averageRating != null
              ? <span className="flex items-center gap-2"><span>{Number(item.averageRating).toFixed(1)}</span><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedItemForReviews(item); }} className="text-xs text-orange-500 underline underline-offset-2 hover:text-orange-600">({item.ratingCount || 0} reviews)</button></span>
              : '—'
            }
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} /> {item.preparationTime || '—'} min
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 max-[420px]:flex-col max-[420px]:items-stretch">
          <span className="font-heading text-[1.05rem] font-bold text-slate-900">
            LKR {Number(item.price || 0).toLocaleString()}
          </span>
          <button
            className="inline-flex min-w-[128px] items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-[0.92rem] font-semibold text-white shadow-md transition-colors duration-200 hover:bg-orange-600 max-[420px]:w-full"
            onClick={() => addToCart(item)}
            aria-label={`Add ${item.name} to cart`}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <CustomerPageShell maxWidth="max-w-none" contentClassName="px-0 py-0">
      <Navbar />

      <div className="mx-auto mt-4 w-full max-w-5xl px-3 sm:px-6">
        <div className="flex items-center gap-3 rounded-[2rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:px-6">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[16px] border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-16 text-[0.92rem] text-slate-800 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold tracking-wider text-slate-400 hover:text-orange-500"
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
          <CustomerStateCard
            variant="loading"
            title="Loading the menu"
            description="We’re fetching fresh menu items for this branch."
            className="mx-auto max-w-2xl"
          />
        ) : error ? (
          <CustomerStateCard
            variant="error"
            title="Menu unavailable"
            description={error}
            primaryAction={{
              label: 'Try Again',
              onClick: () => window.location.reload(),
            }}
            className="mx-auto max-w-2xl"
          />
        ) : Object.keys(groupedCategories).length === 0 ? (
          <CustomerStateCard
            variant="empty"
            icon={Search}
            title="No matching items found"
            description={`We couldn't find anything matching "${searchQuery}". Try a different term.`}
            primaryAction={{
              label: searchQuery ? 'Clear Search' : 'Browse Menu',
              onClick: () => (searchQuery ? setSearchQuery('') : navigate('/menu')),
            }}
            className="mx-auto max-w-2xl"
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCategories).map(
              ([categoryName, subCategories]) => (
                <div key={categoryName} className="space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-block h-8 w-1 rounded-full bg-orange-500" />
                      <h3 className="font-heading text-[1.15rem] font-bold text-slate-800">
                        {categoryName}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
                              <h4 className="flex items-center gap-2 font-heading text-[1rem] font-semibold text-slate-600">
                                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                                {subCategoryName}
                              </h4>
                              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                                {items.length} items
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                            <AnimatePresence>
                              {items.map((item, idx) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.35, delay: Math.min(0.25, idx * 0.08) }}
                                  layout
                                >
                                  {renderMenuCard(item)}
                                </motion.div>
                              ))}
                            </AnimatePresence>
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

      {/* Bottom Trust Bar */}
      <div className="px-6 py-6 text-center text-sm text-slate-500 max-md:px-4">
        Fresh ingredients, consistent plating, and a simpler experience.
      </div>

      {selectedItemForReviews && (
        <MenuItemReviewsModal
          item={selectedItemForReviews}
          onClose={() => setSelectedItemForReviews(null)}
        />
      )}
    </CustomerPageShell>
  );
}