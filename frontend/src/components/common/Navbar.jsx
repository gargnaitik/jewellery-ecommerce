import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import useCartStore from '../../store/cart.store';
import useGoldStore from '../../store/gold.store';
import './Navbar.css';
import GoldRateTicker from './GoldRateTicker';

/* ─── Category mega-menu data ────────────────────────────────── */
const CATEGORIES = [
  {
    title: 'By Type',
    links: [
      { label: 'Rings', to: '/products?category=rings' },
      { label: 'Necklaces', to: '/products?category=necklaces' },
      { label: 'Earrings', to: '/products?category=earrings' },
      { label: 'Bangles', to: '/products?category=bangles' },
      { label: 'Bracelets', to: '/products?category=bracelets' },
      { label: 'Pendants', to: '/products?category=pendants' },
    ],
  },
  {
    title: 'By Metal',
    links: [
      { label: 'Gold', to: '/products?metal=gold' },
      { label: 'Diamond', to: '/products?metal=diamond' },
      { label: 'Silver', to: '/products?metal=silver' },
      { label: 'Platinum', to: '/products?metal=platinum' },
    ],
  },
  {
    title: 'By Occasion',
    links: [
      { label: 'Wedding', to: '/products?occasion=wedding' },
      { label: 'Daily Wear', to: '/products?occasion=daily' },
      { label: 'Festive', to: '/products?occasion=festive' },
      { label: 'Gifting', to: '/products?occasion=gifting' },
    ],
  },
];

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/products', hasMega: true },
];


/* ═══════════════════════════════════════════════════════════════
   Search Overlay
   ═══════════════════════════════════════════════════════════════ */
function SearchOverlay({ isOpen, onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className={`search-overlay ${isOpen ? 'search-overlay--open' : ''}`}>
      <div className="search-overlay__backdrop" onClick={onClose} />
      <div className="search-overlay__content">
        <form onSubmit={handleSubmit} className="search-overlay__form">
          <Search size={20} className="search-overlay__icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for rings, necklaces, gold jewellery..."
            className="search-overlay__input"
            id="navbar-search-input"
          />
          <button
            type="button"
            onClick={onClose}
            className="search-overlay__close"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Mega Menu Dropdown
   ═══════════════════════════════════════════════════════════════ */
function MegaMenu({ isOpen }) {
  return (
    <div className={`mega-menu ${isOpen ? 'mega-menu--open' : ''}`}>
      <div className="mega-menu__inner">
        {CATEGORIES.map((category) => (
          <div key={category.title} className="mega-menu__column">
            <h4 className="mega-menu__title">{category.title}</h4>
            <ul className="mega-menu__list">
              {category.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="mega-menu__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mega-menu__column mega-menu__highlight">
          <div className="mega-menu__promo">
            <span className="mega-menu__promo-tag">New Arrivals</span>
            <h4 className="mega-menu__promo-title">Bridal Collection 2025</h4>
            <p className="mega-menu__promo-text">
              Explore our latest bridal sets crafted with 22K gold and natural diamonds.
            </p>
            <Link to="/products?tag=bridal" className="mega-menu__promo-cta">
              Shop Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   User Dropdown
   ═══════════════════════════════════════════════════════════════ */
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="nav-action-btn"
        aria-label="User menu"
        id="user-menu-btn"
      >
        <User size={20} />
      </button>
      <div className={`user-dropdown__menu ${open ? 'user-dropdown__menu--open' : ''}`}>
        <div className="user-dropdown__greeting">
          <span className="user-dropdown__hello">Hello,</span>
          <span className="user-dropdown__name">{user.name?.split(' ')[0] || 'User'}</span>
        </div>
        <div className="user-dropdown__divider" />
        <Link to="/orders" className="user-dropdown__link" onClick={() => setOpen(false)}>
          My Orders
        </Link>
        <Link to="/profile" className="user-dropdown__link" onClick={() => setOpen(false)}>
          Profile
        </Link>
        <div className="user-dropdown__divider" />
        <button
          onClick={() => { onLogout(); setOpen(false); }}
          className="user-dropdown__logout"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Navbar
   ═══════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const { fetchRate } = useGoldStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaTimeoutRef = useRef(null);

  /* Fetch gold rates once on mount */
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMegaEnter = () => {
    clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 200);
  };

  const cartCount = cartItems.length;

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className={`navbar-wrapper ${scrolled ? 'navbar-wrapper--scrolled' : ''}`}>
        {/* Gold Rate Ticker */}
        <GoldRateTicker />

        {/* Main Nav */}
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="navbar__inner">
            {/* Logo */}
            <Link to="/" className="navbar__logo" id="navbar-logo">
              <span className="navbar__logo-name">Kanakam</span>
              <span className="navbar__logo-tagline">Fine Jewellery</span>
            </Link>

            {/* Desktop Links */}
            <ul className="navbar__links">
              {NAV_LINKS.map(({ label, to, hasMega }) => (
                <li
                  key={to}
                  className="navbar__link-item"
                  onMouseEnter={hasMega ? handleMegaEnter : undefined}
                  onMouseLeave={hasMega ? handleMegaLeave : undefined}
                >
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                    }
                  >
                    {label}
                    {hasMega && <ChevronDown size={12} className="navbar__link-chevron" />}
                  </NavLink>
                  {hasMega && <MegaMenu isOpen={megaOpen} />}
                </li>
              ))}
            </ul>

            {/* Right Actions */}
            <div className="navbar__actions">
              <button
                onClick={() => setSearchOpen(true)}
                className="nav-action-btn"
                aria-label="Search"
                id="navbar-search-btn"
              >
                <Search size={20} />
              </button>

              <button onClick={() => useCartStore.getState().openCart()} className="nav-action-btn nav-action-btn--cart" aria-label="Cart" id="navbar-cart-btn">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="nav-action-btn__badge">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </button>

              {isAuthenticated && user ? (
                <UserDropdown user={user} onLogout={logout} />
              ) : (
                <Link to="/login" className="navbar__signin" id="navbar-signin-btn">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                className="navbar__hamburger"
                aria-label="Toggle mobile menu"
                id="navbar-hamburger"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mega Menu backdrop */}
        {megaOpen && (
          <div
            className="mega-menu-backdrop"
            onMouseEnter={handleMegaLeave}
          />
        )}
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer-backdrop ${mobileOpen ? 'mobile-drawer-backdrop--open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`mobile-drawer ${mobileOpen ? 'mobile-drawer--open' : ''}`}>
        <div className="mobile-drawer__header">
          <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
            <span className="navbar__logo-name">Kanakam</span>
            <span className="navbar__logo-tagline">Fine Jewellery</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-drawer__close"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mobile-drawer__body">
          {/* Search */}
          <div className="mobile-drawer__search">
            <Search size={16} className="mobile-drawer__search-icon" />
            <input
              type="text"
              placeholder="Search jewellery..."
              className="mobile-drawer__search-input"
            />
          </div>

          {/* Links */}
          <nav className="mobile-drawer__nav">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `mobile-drawer__link ${isActive ? 'mobile-drawer__link--active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Category groups */}
          <div className="mobile-drawer__categories">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="mobile-drawer__cat-group">
                <h4 className="mobile-drawer__cat-title">{cat.title}</h4>
                {cat.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="mobile-drawer__cat-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mobile-drawer__footer">
          {isAuthenticated && user ? (
            <>
              <div className="mobile-drawer__user">
                <User size={18} />
                <span>Hello, {user.name?.split(' ')[0]}</span>
              </div>
              <Link to="/orders" className="mobile-drawer__footer-link" onClick={() => setMobileOpen(false)}>
                My Orders
              </Link>
              <Link to="/profile" className="mobile-drawer__footer-link" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="mobile-drawer__logout">
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-drawer__signin" onClick={() => setMobileOpen(false)}>
              Sign In / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
