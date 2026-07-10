import { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import menuHeroBanner from '../../assets/menu hero banner simple.png';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  ShoppingCart,
  ChefHat,
  Search,
  ArrowUpDown,
  Leaf,
  Flame
} from 'lucide-react';
import { toast } from 'react-toastify';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recommended');
  const [selectedItemForReviews, setSelectedItemForReviews] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const branchId = getBranchId();

  const {
    data: menuItems = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['menuItems', branchId],
    queryFn: async () => {
      const res = await getCustomerMenu(branchId);
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Unable to load menu items.');
      }

      const items = Array.isArray(payload?.data) ? payload.data : [];
      return items.map((item) => ({
        ...item,
        image: item.imageUrl,
        price: Number(item.price),
        averageRating: item.averageRating ?? null,
        ratingCount: item.ratingCount ?? 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const error = queryError?.message || '';

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { groupedCategories, flatItems, isFlat } = useMemo(() => {
    let filteredItems = menuItems.filter((item) => {
      if (!deferredSearchQuery.trim()) return true;

      const query = deferredSearchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    });

    if (sortOption !== 'recommended') {
      const sorted = [...filteredItems].sort((a, b) => {
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'rating_desc') return (b.averageRating || 0) - (a.averageRating || 0);
        return 0;
      });
      return { groupedCategories: {}, flatItems: sorted, isFlat: true };
    }

    const grouped = filteredItems.reduce((accumulator, item) => {
      const categoryKey = item.categoryName || 'Uncategorized';
      const subCategoryKey = item.subCategory || 'General';

      if (!accumulator[categoryKey]) accumulator[categoryKey] = {};
      if (!accumulator[categoryKey][subCategoryKey]) accumulator[categoryKey][subCategoryKey] = [];

      accumulator[categoryKey][subCategoryKey].push(item);
      return accumulator;
    }, {});

    return { groupedCategories: grouped, flatItems: [], isFlat: false };
  }, [menuItems, deferredSearchQuery, sortOption]);

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

      <div className="mx-3 sm:mx-6 mt-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-[24px] sm:rounded-full border border-orange-100 bg-gradient-to-r from-[#fff3eb] via-[#fff9f5] to-[#fff3eb] p-3 sm:p-4 shadow-[0_4px_20px_rgba(249,115,22,0.05)]">

          <div className="flex w-full sm:w-auto items-center gap-3 flex-1">
            <button
              className="shrink-0 inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white bg-white text-slate-700 shadow-sm transition-colors hover:border-orange-200 hover:text-orange-600"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[50px] rounded-full border border-white bg-white py-2 pl-12 pr-12 sm:pr-16 text-[0.95rem] text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold tracking-wider text-slate-400 hover:text-orange-500"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-orange-500">
              <ArrowUpDown size={18} />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none h-[50px] w-full cursor-pointer rounded-full border border-white bg-white pl-12 pr-12 text-[0.95rem] font-semibold text-slate-800 shadow-sm outline-none transition-all hover:border-orange-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50"
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

        </div>
      </div>

      {!searchQuery && (
        <section
          className="relative mx-3 mt-2 mb-2 overflow-hidden rounded-[20px] md:rounded-[24px] bg-[length:100%_100%] md:bg-cover bg-center bg-no-repeat border border-orange-100/50 shadow-[0_4px_20px_rgba(249,115,22,0.03)] sm:mx-6"
          style={{ backgroundImage: `url('${menuHeroBanner}')` }}
        >
          <div className="relative z-10 w-full flex flex-row items-center justify-between gap-1 md:gap-4 px-2 py-3 md:p-6 sm:px-10 sm:py-8 max-w-6xl mx-auto">

            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4 text-center md:text-left md:border-r md:border-orange-200/40 md:pr-6 flex-1 md:flex-none">
              <div className="shrink-0 p-1.5 md:p-3 rounded-full bg-white shadow-sm border border-orange-100 text-orange-500 transition-transform hover:scale-110 duration-300">
                <Leaf strokeWidth={1.5} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-heading text-[0.65rem] xs:text-[0.7rem] md:text-[1rem] font-bold text-slate-800 leading-tight">
                  <span className="md:hidden">Fresh</span>
                  <span className="hidden md:inline">Fresh Ingredients</span>
                </h3>
                <p className="hidden md:block text-[0.85rem] font-medium text-slate-500 mt-0.5">Sourced daily</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4 text-center md:text-left md:border-r md:border-orange-200/40 md:px-6 flex-1 md:flex-none">
              <div className="shrink-0 p-1.5 md:p-3 rounded-full bg-white shadow-sm border border-orange-100 text-orange-500 transition-transform hover:scale-110 duration-300">
                <ChefHat strokeWidth={1.5} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-heading text-[0.65rem] xs:text-[0.7rem] md:text-[1rem] font-bold text-slate-800 leading-tight">
                  <span className="md:hidden">Crafted</span>
                  <span className="hidden md:inline">Chef Crafted</span>
                </h3>
                <p className="hidden md:block text-[0.85rem] font-medium text-slate-500 mt-0.5">Made with passion</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4 text-center md:text-left md:border-r md:border-orange-200/40 md:px-6 flex-1 md:flex-none">
              <div className="shrink-0 p-1.5 md:p-3 rounded-full bg-white shadow-sm border border-orange-100 text-orange-500 transition-transform hover:scale-110 duration-300">
                <Flame strokeWidth={1.5} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-heading text-[0.65rem] xs:text-[0.7rem] md:text-[1rem] font-bold text-slate-800 leading-tight">
                  <span className="md:hidden">Signature</span>
                  <span className="hidden md:inline">Signature Flavors</span>
                </h3>
                <p className="hidden md:block text-[0.85rem] font-medium text-slate-500 mt-0.5">Unforgettable taste</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4 text-center md:text-left md:pl-6 flex-1 md:flex-none">
              <div className="shrink-0 p-1.5 md:p-3 rounded-full bg-white shadow-sm border border-orange-100 text-orange-500 transition-transform hover:scale-110 duration-300">
                <Heart strokeWidth={1.5} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-heading text-[0.65rem] xs:text-[0.7rem] md:text-[1rem] font-bold text-slate-800 leading-tight">
                  <span className="md:hidden">For You</span>
                  <span className="hidden md:inline">Made for You</span>
                </h3>
                <p className="hidden md:block text-[0.85rem] font-medium text-slate-500 mt-0.5">Every dish matters</p>
              </div>
            </div>

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
                ? `Found ${isFlat ? flatItems.length : Object.values(groupedCategories).flatMap((sub) => Object.values(sub)).flat().length} matches`
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
        ) : (isFlat && flatItems.length === 0) || (!isFlat && Object.keys(groupedCategories).length === 0) ? (
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
            {isFlat ? (
              <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                <AnimatePresence>
                  {flatItems.map((item, idx) => (
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
            ) : (
              Object.entries(groupedCategories).map(
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
              )
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