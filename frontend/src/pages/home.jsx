import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from 'lucide-react';
import heroImg from '../assets/hero.png';
import ringsImg from '../assets/category-rings.png';
import necklacesImg from '../assets/category-necklaces.png';
import useProductStore from '../store/product.store';
import useGoldStore from '../store/gold.store';
import { calculateDisplayPrice } from '../utils/productAdapter';
import './home.css';

/* ── Category data ────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Rings', to: '/products?category=rings', image: ringsImg },
  { label: 'Necklaces', to: '/products?category=necklaces', image: necklacesImg },
  { label: 'Earrings', to: '/products?category=earrings', gradient: 'linear-gradient(135deg, #1a1710, #2a2318)' },
  { label: 'Bangles', to: '/products?category=bangles', gradient: 'linear-gradient(135deg, #1a1710, #2a2318)' },
  { label: 'Pendants', to: '/products?category=pendants', gradient: 'linear-gradient(135deg, #1a1710, #2a2318)' },
  { label: 'Bracelets', to: '/products?category=bracelets', gradient: 'linear-gradient(135deg, #1a1710, #2a2318)' },
];

/* ── Product card skeleton ────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="product-card product-card--skeleton">
      <div className="product-card__image product-card__image--skeleton" />
      <div className="product-card__info">
        <div className="skeleton-line skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--sm" />
        <div className="skeleton-line skeleton-line--md" />
      </div>
    </div>
  );
}

export default function Home() {
  const { products, loading, fetchProducts } = useProductStore();
  const { price22k } = useGoldStore();

  /* Fetch 6 featured products on mount */
  useEffect(() => {
    fetchProducts({ limit: 6, sort: 'newest' });
  }, []);

  const featured = products.slice(0, 6);

  return (
    <div className="home">

      {/* ═══ Hero ═══ */}
      <section className="hero" id="hero-section">
        <div className="hero__bg">
          <img src={heroImg} alt="" className="hero__bg-img" />
          <div className="hero__bg-overlay" />
        </div>
        <div className="hero__content">
          <span className="hero__label">
            <Sparkles size={14} /> New Collection 2025
          </span>
          <h1 className="hero__title">
            Timeless Elegance,<br />
            <span className="hero__title-accent">Crafted in Gold</span>
          </h1>
          <p className="hero__subtitle">
            Discover BIS hallmarked jewellery with live gold pricing.
            Every piece tells a story of tradition and artistry.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="hero__cta hero__cta--primary">
              Explore Collections <ArrowRight size={18} />
            </Link>
            <Link to="/gold-rate" className="hero__cta hero__cta--secondary">
              Today's Gold Rate
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="section categories-section" id="categories-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__label">Curated For You</span>
            <h2 className="section__title">Shop By Category</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(({ label, to, image, gradient }) => (
              <Link to={to} key={label} className="category-card">
                <div
                  className="category-card__image"
                  style={image ? { backgroundImage: `url(${image})` } : { background: gradient }}
                >
                  <div className="category-card__overlay" />
                </div>
                <div className="category-card__content">
                  <h3 className="category-card__name">{label}</h3>
                  <span className="category-card__cta">
                    Shop Now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Featured Products ═══ */}
      <section className="section featured-section" id="featured-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__label">Handpicked</span>
            <h2 className="section__title">Featured Jewellery</h2>
            <Link to="/products" className="section__view-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="featured-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              : featured.map((product) => {
                const price = calculateDisplayPrice(product, price22k);
                return (
                  <Link
                    to={`/products/${product._id}`}
                    key={product._id}
                    className="product-card"
                  >
                    <div className="product-card__image">
                      {product.primaryImage
                        ? <img src={product.primaryImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div className="product-card__placeholder"><Sparkles size={24} /></div>
                      }
                      {product.tag && (
                        <span className="product-card__tag">{product.tag}</span>
                      )}
                      <div className="product-card__actions-overlay">
                        <button className="product-card__quick-btn">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="product-card__info">
                      <h3 className="product-card__name">{product.name}</h3>
                      <span className="product-card__meta">
                        {product.metal} · {product.weight}g
                      </span>
                      <span className="product-card__price">
                        ₹{Math.round(price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </Link>
                );
              })
            }
          </div>
        </div>
      </section>

      {/* ═══ Promo Banner ═══ */}
      <section className="promo-banner" id="promo-section">
        <div className="promo-banner__inner">
          <div className="promo-banner__content">
            <span className="promo-banner__label">Bridal Season</span>
            <h2 className="promo-banner__title">
              Make Your Special Day<br />
              <span>Unforgettable</span>
            </h2>
            <p className="promo-banner__text">
              Explore our exclusive bridal collection — handcrafted 22K gold sets
              with natural diamonds and precious stones.
            </p>
            <Link to="/products?occasion=wedding" className="promo-banner__cta">
              Shop Bridal Collection <ArrowRight size={16} />
            </Link>
          </div>
          <div className="promo-banner__visual">
            <div className="promo-banner__ornament" />
          </div>
        </div>
      </section>

      {/* ═══ Why Kanakam ═══ */}
      <section className="section why-section" id="why-section">
        <div className="section__inner">
          <div className="section__header">
            <span className="section__label">The Kanakam Promise</span>
            <h2 className="section__title">Why Choose Us</h2>
          </div>
          <div className="why-grid">
            {[
              { icon: <Shield size={28} />, title: 'BIS Hallmarked', desc: 'Every piece is BIS 916 certified, guaranteeing purity and authenticity of gold.' },
              { icon: <Sparkles size={28} />, title: 'Live Gold Pricing', desc: 'Transparent pricing linked to live MCX gold rates, updated every 15 minutes.' },
              { icon: <Truck size={28} />, title: 'Insured Shipping', desc: 'Free insured delivery on orders above ₹10,000 with real-time tracking.' },
              { icon: <RotateCcw size={28} />, title: '15-Day Returns', desc: 'Hassle-free returns with full refund. No questions asked.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="why-card">
                <div className="why-card__icon">{icon}</div>
                <h3 className="why-card__title">{title}</h3>
                <p className="why-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Newsletter ═══ */}
      <section className="newsletter" id="newsletter-section">
        <div className="newsletter__inner">
          <h2 className="newsletter__title">Stay Golden</h2>
          <p className="newsletter__text">
            Get exclusive offers, gold rate alerts, and new collection previews delivered to your inbox.
          </p>
          <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter__input"
              id="newsletter-email"
            />
            <button type="submit" className="newsletter__btn">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}