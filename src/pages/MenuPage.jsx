import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import {
  ArrowLeft,
  Heart,
  Search,
  Star,
  Clock,
  Flame,
  Award,
  Leaf,
  ChefHat,
  BadgeCheck,
  ShoppingCart,
} from 'lucide-react';

const COVER_IMAGE =
  'https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJpdmF0ZSUyMGRpbmluZ3xlbnwwfHwwfHx8MA==';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

const MENU_ITEMS = [
  {
    id: 1,
    name: 'Wagyu Beef Burger',
    tag: "Chef's Choice",
    description: 'Premium Japanese wagyu patty, aged cheddar, caramelized onions, truffle aioli',
    rating: 4.9,
    reviews: 234,
    prepTime: '10-22 min',
    calories: 600,
    price: 500,
    image:
      'https://cdn.prod.website-files.com/65fc1fa2c1e7707c3f051466/69263773f626fe9424210272_750f721e-ad71-4daa-8601-bc3c78b9587d.webp',
    badges: ['POPULAR'],
    category: 'Burgers',
    isVerified: true,
  },
  {
    id: 2,
    name: 'Margherita Napoletana',
    tag: 'Authentic',
    description: 'San Marzano tomatoes, buffalo mozzarella, fresh basil, extra virgin',
    rating: 4.9,
    reviews: 567,
    prepTime: '15-18 min',
    calories: 520,
    price: 1200,
    image:
      'https://mediterraneanrecipes.com.au/wp-content/uploads/2024/01/Margherita-Pizza.jpg',
    badges: ['POPULAR'],
    category: 'Pizza',
    isVerified: false,
  },
  {
    id: 3,
    name: 'Molten Chocolate Soufflé',
    tag: 'Signature',
    description: 'Valrhona dark chocolate, vanilla bean ice cream, gold leaf, raspberry coulis',
    rating: 5,
    reviews: 412,
    prepTime: '20-25 min',
    calories: 480,
    price: 850,
    image:
      'https://karenehman.com/wp-content/uploads/2024/10/Hot-Fudge-Sundae-Cake-Take-two.jpg',
    badges: ['POPULAR'],
    category: 'Desserts',
    isVerified: true,
  },
  {
    id: 4,
    name: 'Signature BBQ Burger',
    tag: 'Bestseller',
    description: 'Double angus beef, applewood bacon, aged cheddar, house BBQ sauce.',
    rating: 4.8,
    reviews: 345,
    prepTime: '18-22 min',
    calories: 820,
    price: 950,
    image:
      'https://mefamilyfarm.com/cdn/shop/files/mae-mu-I7A_pHLcQK8-unsplash.jpg?v=1751451226&width=1445',
    badges: ['POPULAR'],
    category: 'Burgers',
    isVerified: false,
  },
  {
    id: 5,
    name: 'Tartufo Bianco Pizza',
    tag: 'Luxury',
    description: 'White truffle cream, wild mushrooms, fontina cheese, arugula, white truffle oil',
    rating: 4.9,
    reviews: 278,
    prepTime: '15-18 min',
    calories: 640,
    price: 1400,
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA=',
    badges: ['NEW', 'POPULAR'],
    category: 'Pizza',
    isVerified: true,
  },
  {
    id: 6,
    name: 'Truffle Carbonara',
    tag: 'Italian',
    description: 'Fresh pasta, Italian pancetta, organic eggs, aged parmesan,',
    rating: 4.8,
    reviews: 189,
    prepTime: '16-20 min',
    calories: 590,
    price: 1200,
    image:
      'https://www.salepepe.com/media-library/image.jpg?id=26691626&width=1200&height=1200&coordinates=1058,0,1058,0',
    badges: ['NEW'],
    category: 'Pasta',
    isVerified: false,
  },
  {
    id: 7,
    name: 'Mediterranean Quinoa Bowl',
    tag: 'Healthy',
    description: 'Organic quinoa, roasted vegetables, feta cheese, olives, lemon herb',
    rating: 4.7,
    reviews: 123,
    prepTime: '12-15 min',
    calories: 420,
    price: 890,
    image:
      'https://cafeconnection.org/wp-content/uploads/2021/10/monika-grabkowska-pCxJvSeSB5A-unsplash-edited-scaled.jpg',
    badges: [],
    category: 'Salads',
    isVerified: false,
  },
  {
    id: 8,
    name: 'Artisan Lemonade',
    tag: 'Refreshing',
    description: 'Fresh-squeezed lemons, organic honey, fresh mint, sparkling water',
    rating: 4.6,
    reviews: 89,
    prepTime: '5-8 min',
    calories: 120,
    price: 990,
    image:
      'https://ellis.be/content/uploads/2021/07/CraftLemonadeLemon_Website.jpg',
    badges: [],
    category: 'Beverages',
    isVerified: true,
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ───── Search Bar ───── */}
      <div className="relative mx-auto mb-5 mt-4 w-full max-w-5xl px-3 sm:px-6">
        <button
          className="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 sm:left-6"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="relative mx-auto w-full max-w-3xl py-2">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search our curated menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-[42px] pr-4 text-[0.9rem] text-gray-800 outline-none transition-all duration-300 ease-smooth placeholder:text-gray-400 focus:border-orange focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]"
          />
        </div>
      </div>

      {/* ───── Hero Banner ───── */}
      <section
        className="relative mx-6 rounded-[16px] h-[280px] bg-cover bg-center overflow-hidden flex items-end max-md:h-[200px] max-md:mx-4"
        style={{ backgroundImage: `url(${COVER_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/15" />
        <div className="relative z-[1] p-8 text-white">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-[8px] text-[0.7rem] font-semibold tracking-[0.5px] uppercase text-white mb-3">
            <ChefHat size={14} /> CURATED BY CHEF MICHAEL ANDERSON
          </span>
          <h1 className="font-heading text-[2.5rem] font-extrabold leading-[1.1] mb-2.5 max-md:text-[1.6rem]">
            Culinary Excellence
          </h1>
          <p className="text-[0.9rem] leading-relaxed opacity-[0.88] max-w-[540px]">
            Experience the finest flavors crafted with passion, premium
            ingredients, and decades of culinary expertise
          </p>
        </div>
      </section>

      {/* ───── Category Tabs ───── */}
      <div className="flex gap-2.5 px-6 pt-8 flex-wrap max-md:px-4 max-md:pt-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-[22px] py-[9px] rounded-full border text-[0.875rem] font-medium transition-all duration-300 ease-smooth ${activeCategory === cat ? "bg-navy text-white border-navy" : "bg-white text-gray-800 border-gray-200 hover:border-navy hover:text-navy"}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ───── Menu Grid ───── */}
      <section className="px-6 pt-7 pb-9 max-md:px-4 max-md:py-5">
        <h2 className="font-heading text-[1.6rem] font-bold text-navy mb-1">
          Our Menu
        </h2>
        <p className="text-[0.875rem] text-gray-500 mb-6">
          {filteredItems.length} handcrafted dishes
        </p>

        <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
          {filteredItems.map((item) => (
            <div
              className="flex border border-gray-200 rounded-[14px] overflow-hidden bg-white transition-all duration-300 ease-smooth hover:shadow-card hover:-translate-y-0.5 max-[480px]:flex-col"
              key={item.id}
            >
              {/* Image */}
              <div className="relative w-[160px] min-h-[190px] shrink-0 max-md:w-[120px] max-md:min-h-[140px] max-[480px]:w-full max-[480px]:min-h-[180px]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`inline-flex items-center gap-[3px] px-2 py-[3px] rounded text-[0.6rem] font-bold uppercase tracking-[0.3px] ${badge === "NEW" ? "bg-orange text-white" : "bg-[#22C55E] text-white"}`}
                    >
                      {badge === "POPULAR" && <Flame size={10} />} {badge}
                    </span>
                  ))}
                </div>
                {/* Verified */}
                {item.isVerified && (
                  <span className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-orange text-white flex items-center justify-center">
                    <BadgeCheck size={18} />
                  </span>
                )}
                {/* Favorite */}
                <button
                  className={`absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/90 backdrop-blur-[4px] flex items-center justify-center border-none transition-all duration-300 ease-smooth ${favorites.includes(item.id) ? "text-orange" : "text-gray-400"} hover:text-orange`}
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart
                    size={16}
                    fill={favorites.includes(item.id) ? "#FF6B35" : "none"}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 p-4 px-[18px] flex flex-col min-w-0">
                <h3 className="font-heading text-base font-bold text-navy mb-[5px]">
                  {item.name}
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[0.7rem] font-medium w-fit mb-2">
                  {item.tag}
                </span>
                <p className="text-[0.78rem] text-gray-500 leading-relaxed mb-2.5 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 text-[0.75rem] text-gray-500 mb-3 flex-wrap">
                  <span className="flex items-center gap-[3px] font-semibold text-gray-800">
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />{" "}
                    {item.rating}
                    <small className="font-normal text-gray-400">
                      ({item.reviews})
                    </small>
                  </span>
                  <span className="flex items-center gap-[3px]">
                    <Clock size={14} /> {item.prepTime}
                  </span>
                  <span className="text-gray-400">{item.calories} cal</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="font-heading text-[1.1rem] font-bold text-navy">
                    LKR {item.price.toLocaleString()}
                  </span>
                  <button
                    className="inline-flex min-w-[118px] items-center justify-center gap-1.5 rounded-lg border border-orange-600 bg-orange-500 px-4 py-2.5 text-[0.82rem] font-semibold text-white shadow-sm transition-colors duration-300 ease-smooth hover:bg-orange-600"
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingCart size={15} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Bottom Trust Bar ───── */}
      <div className="flex justify-center gap-9 px-6 py-6 border-t border-gray-200 flex-wrap max-md:gap-4 max-md:p-4">
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <Award size={16} color="#FF6B35" /> Michelin Recommended
        </span>
        <span className="flex items-center gap-2 text-[0.85rem] font-medium text-gray-800 max-md:text-[0.75rem]">
          <Star size={16} fill="#F59E0B" color="#F59E0B" /> 4.9 Rating
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
