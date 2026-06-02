import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, X, ChevronDown,
  Sparkles, ArrowUpDown, Filter
} from 'lucide-react';
import useGoldStore from '../../store/gold.store';
import useProductStore from '../../store/product.store';
import { calculateDisplayPrice } from '../../utils/productAdapter';
import './Products.css';

const CATEGORIES = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bangles', 'Pendants', 'Bracelets'];
const METALS = ['All', '22K Gold', '24K Gold', '18K Gold', 'Platinum', 'Silver'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'weight-asc', label: 'Weight: Light to Heavy' },
  { value: 'newest', label: 'Newest First' },
];

/* ── Helpers ─────────────────────────────────────────────────── */
const fmt = (n) => '₹' + n.toLocaleString('en-IN');

/* ── Product Card ────────────────────────────────────────────── */
function ProductCard({ product, goldRate }) {
  const price = calculateDisplayPrice(product, goldRate);

  return (
    <Link to={`/products/${product._id}`} className="pc">
      <div className="pc__img">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} />
        ) : (
          <div className="pc__placeholder"><Sparkles size={28} /></div>
        )}
        {product.tag && <span className="pc__tag">{product.tag}</span>}
        <div className="pc__overlay">
          <button className="pc__quick" onClick={e => e.preventDefault()}>
            Quick View
          </button>
        </div>
      </div>
      <div className="pc__info">
        <h3 className="pc__name">{product.name}</h3>
        <span className="pc__meta">{product.metal} · {product.weight}g</span>
        <span className="pc__price">{fmt(Math.round(price))}</span>
      </div>
    </Link>
  );
}

/* ── Filter Chip ─────────────────────────────────────────────── */
function Chip({ label, onRemove }) {
  return (
    <span className="chip">
      {label}
      <button className="chip__remove" onClick={onRemove} aria-label="Remove filter">
        <X size={12} />
      </button>
    </span>
  );
}

/* ── Sidebar content (shared desktop + mobile) ───────────── */
function SidebarContent({
  chips,
  category,
  metal,
  maxPrice,
  clearAll,
  setCategory,
  setMetal,
  setMaxPrice,
  closeSidebar,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__title">Filters</span>
        {chips.length > 0 && (
          <button className="sidebar__clear" onClick={clearAll}>Clear all</button>
        )}
      </div>

      <div className="filter-group">
        <h4 className="filter-group__label">Category</h4>
        <div className="filter-group__options">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`filter-opt ${category === c ? 'filter-opt--active' : ''}`}
              onClick={() => { setCategory(c); closeSidebar(); }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-group__label">Metal</h4>
        <div className="filter-group__options">
          {METALS.map(m => (
            <button
              key={m}
              className={`filter-opt ${metal === m ? 'filter-opt--active' : ''}`}
              onClick={() => setMetal(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-group__label">Max Price</h4>
        <div className="price-range">
          <input
            type="range"
            min={10000}
            max={700000}
            step={5000}
            value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            className="price-slider"
          />
          <div className="price-range__labels">
            <span>₹10,000</span>
            <span className="price-range__val">{fmt(maxPrice)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, totalCount, loading, error, fetchProducts } = useProductStore();
  const { price22k } = useGoldStore();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [metal, setMetal] = useState(searchParams.get('metal') || 'All');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 700000);
  const [sort, setSort] = useState(searchParams.get('sort') || 'default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const occasion = searchParams.get('occasion') || '';

  useEffect(() => {
    fetchProducts({ search, category, metal, maxPrice, sort, occasion });
  }, [fetchProducts, search, category, metal, maxPrice, sort, occasion]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (metal !== 'All') params.metal = metal;
    if (maxPrice < 700000) params.maxPrice = String(maxPrice);
    if (sort !== 'default') params.sort = sort;
    if (occasion) params.occasion = occasion;
    setSearchParams(params, { replace: true });
  }, [category, maxPrice, metal, occasion, search, setSearchParams, sort]);

  /* ── Active chips ────────────────────────────────────────── */
  const chips = [];
  if (search) chips.push({ label: `"${search}"`, onRemove: () => setSearch('') });
  if (category !== 'All') chips.push({ label: category, onRemove: () => setCategory('All') });
  if (metal !== 'All') chips.push({ label: metal, onRemove: () => setMetal('All') });
  if (maxPrice < 700000) chips.push({ label: `Under ${fmt(maxPrice)}`, onRemove: () => setMaxPrice(700000) });

  const clearAll = () => {
    setSearch(''); setCategory('All'); setMetal('All'); setMaxPrice(700000); setSort('default');
  };

  return (
    <div className="products-page">

      {/* ── Top bar ── */}
      <div className="products-topbar">
        <div className="products-topbar__inner">

          {/* Search */}
          <div className="prod-search">
            <Search size={16} className="prod-search__icon" />
            <input
              type="search"
              placeholder="Search jewellery…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="prod-search__input"
            />
            {search && (
              <button className="prod-search__clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="products-topbar__right">
            {/* Sort */}
            <div className="sort-wrap">
              <button className="sort-btn" onClick={() => setSortOpen(p => !p)}>
                <ArrowUpDown size={14} />
                {SORT_OPTIONS.find(s => s.value === sort)?.label}
                <ChevronDown size={13} className={sortOpen ? 'rotated' : ''} />
              </button>
              {sortOpen && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`sort-item ${sort === opt.value ? 'sort-item--active' : ''}`}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
              <Filter size={15} />
              Filters
              {chips.length > 0 && <span className="mobile-filter-badge">{chips.length}</span>}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="chips-row">
            {chips.map(c => <Chip key={c.label} {...c} />)}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="products-body">

        {/* Desktop sidebar */}
        <div className="sidebar-desktop">
          <SidebarContent
            chips={chips}
            category={category}
            metal={metal}
            maxPrice={maxPrice}
            clearAll={clearAll}
            setCategory={setCategory}
            setMetal={setMetal}
            setMaxPrice={setMaxPrice}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar-drawer" onClick={e => e.stopPropagation()}>
              <div className="sidebar-drawer__head">
                <span>Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
              </div>
              <SidebarContent
                chips={chips}
                category={category}
                metal={metal}
                maxPrice={maxPrice}
                clearAll={clearAll}
                setCategory={setCategory}
                setMetal={setMetal}
                setMaxPrice={setMaxPrice}
                closeSidebar={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        <main className="products-main">
          <div className="products-count">
            {totalCount} {totalCount === 1 ? 'piece' : 'pieces'} found
          </div>

          {loading && (
            <div className="empty-state">
              <div className="empty-state__icon"><Sparkles size={36} /></div>
              <h3 className="empty-state__title">Loading jewellery...</h3>
            </div>
          )}

          {error && !loading && (
            <div className="empty-state">
              <div className="empty-state__icon"><Sparkles size={36} /></div>
              <h3 className="empty-state__title">Could not load products</h3>
              <p className="empty-state__text">{error}</p>
            </div>
          )}

          {!loading && !error && products.length > 0 ? (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} goldRate={price22k} />)}
            </div>
          ) : !loading && !error && (
            <div className="empty-state">
              <div className="empty-state__icon"><Sparkles size={36} /></div>
              <h3 className="empty-state__title">No pieces found</h3>
              <p className="empty-state__text">
                Try adjusting your filters or search term.
              </p>
              <button className="empty-state__btn" onClick={clearAll}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
