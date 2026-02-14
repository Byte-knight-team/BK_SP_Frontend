import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  Heart,
  Gift,
  ShoppingCart,
  Search,
  Star,
  Clock,
  Flame,
  ChevronRight,
  Plus,
  Award,
  Leaf,
  ChefHat,
  BadgeCheck,
  CircleCheckBig,
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
  const { addToCart, cartCount } = useCart();

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
    <div className="menu-page">
      {/* ───── Top Header Bar ───── */}
      <header className="menu-header">
        <div className="menu-header__left">
          <button className="menu-header__back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div className="menu-header__brand">
            <img src="/logo.png" alt="Crave House" className="menu-header__logo-img" />
            <div>
              <span className="menu-header__name">Crave House</span>
              <span className="menu-header__sub">
                <Award size={12} /> Michelin
              </span>
            </div>
          </div>
        </div>
        <div className="menu-header__right">
          <button className="menu-header__icon-btn">
            <Heart size={20} />
            <span className="menu-header__badge">3</span>
          </button>
          <button className="menu-header__icon-btn">
            <Gift size={20} />
            <span className="menu-header__badge">2</span>
          </button>
          <button className="menu-header__account">
            <div className="menu-header__avatar">U</div>
            <span>Account</span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-header__cart" onClick={() => navigate('/cart')}>
            <ShoppingCart size={20} color="#fff" />
            {cartCount > 0 && <span className="menu-header__cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ───── Search Bar ───── */}
      <div className="menu-search">
        <Search size={18} className="menu-search__icon" />
        <input
          type="text"
          placeholder="Search our curated menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="menu-search__input"
        />
      </div>

      {/* ───── Hero Banner ───── */}
      <section
        className="menu-hero"
        style={{ backgroundImage: `url(${COVER_IMAGE})` }}
      >
        <div className="menu-hero__overlay" />
        <div className="menu-hero__content">
          <span className="menu-hero__badge">
            <ChefHat size={14} /> CURATED BY CHEF MICHAEL ANDERSON
          </span>
          <h1 className="menu-hero__title">Culinary Excellence</h1>
          <p className="menu-hero__desc">
            Experience the finest flavors crafted with passion, premium ingredients, and decades of
            culinary expertise
          </p>
        </div>
      </section>

      {/* ───── Category Tabs ───── */}
      <div className="menu-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`menu-categories__tab${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ───── Menu Grid ───── */}
      <section className="menu-section">
        <h2 className="menu-section__title">Our Menu</h2>
        <p className="menu-section__subtitle">{filteredItems.length} handcrafted dishes</p>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div className="menu-card" key={item.id}>
              {/* Image */}
              <div className="menu-card__img-wrap">
                <img src={item.image} alt={item.name} className="menu-card__img" />
                {/* Badges */}
                <div className="menu-card__badges">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`menu-card__badge ${badge === 'NEW' ? 'menu-card__badge--new' : 'menu-card__badge--popular'}`}
                    >
                      {badge === 'POPULAR' && <Flame size={10} />} {badge}
                    </span>
                  ))}
                </div>
                {/* Verified */}
                {item.isVerified && (
                  <span className="menu-card__verified">
                    <BadgeCheck size={18} />
                  </span>
                )}
                {/* Favorite */}
                <button
                  className={`menu-card__fav${favorites.includes(item.id) ? ' active' : ''}`}
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart size={16} fill={favorites.includes(item.id) ? '#FF6B35' : 'none'} />
                </button>
              </div>

              {/* Info */}
              <div className="menu-card__info">
                <h3 className="menu-card__name">{item.name}</h3>
                <span className="menu-card__tag">{item.tag}</span>
                <p className="menu-card__desc">{item.description}</p>

                <div className="menu-card__meta">
                  <span className="menu-card__rating">
                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> {item.rating}
                    <small>({item.reviews})</small>
                  </span>
                  <span className="menu-card__time">
                    <Clock size={14} /> {item.prepTime}
                  </span>
                  <span className="menu-card__cal">{item.calories} cal</span>
                </div>

                <div className="menu-card__bottom">
                  <span className="menu-card__price">LKR {item.price.toLocaleString()}</span>
                  <button className="menu-card__add" onClick={() => addToCart(item)}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Bottom Trust Bar ───── */}
      <div className="menu-trust">
        <span className="menu-trust__item">
          <Award size={16} color="#FF6B35" /> Michelin Recommended
        </span>
        <span className="menu-trust__item">
          <Star size={16} fill="#F59E0B" color="#F59E0B" /> 4.9 Rating
        </span>
        <span className="menu-trust__item">
          <Leaf size={16} color="#22C55E" /> Organic Ingredients
        </span>
        <span className="menu-trust__item">
          <ChefHat size={16} color="#FF6B35" /> Expert Chefs
        </span>
      </div>
    </div>
  );
}
