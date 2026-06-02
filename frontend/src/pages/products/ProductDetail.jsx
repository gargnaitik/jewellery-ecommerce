import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ShoppingBag, Heart, Share2, Shield, Truck,
    RotateCcw, ChevronRight, Sparkles, Plus, Minus
} from 'lucide-react';
import useCartStore from '../../store/cart.store';
import useGoldStore from '../../store/gold.store';
import useProductStore from '../../store/product.store';
import { calculateDisplayPrice, imageUrl } from '../../utils/productAdapter';
import './ProductDetail.css';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function ProductDetail() {
    const { id } = useParams();
    const { addItem } = useCartStore();
    const { price18k, price22k, price24k } = useGoldStore();
    const { product, products, loading, error, fetchProduct, fetchProducts, clearProduct } = useProductStore();

    const [activeImg, setActiveImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        fetchProduct(id);
        fetchProducts({ limit: 4 });
        return () => clearProduct();
    }, [clearProduct, fetchProduct, fetchProducts, id]);

    if (loading && !product) {
        return (
            <div className="pd-page">
                <div className="pd-main">
                    <div className="pd-image-placeholder">
                        <Sparkles size={48} />
                        <span>Loading jewellery...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="pd-page">
                <div className="pd-main">
                    <div className="pd-image-placeholder">
                        <Sparkles size={48} />
                        <span>{error || 'Product not found'}</span>
                    </div>
                </div>
            </div>
        );
    }

    const rateMap = { 18: price18k, 22: price22k, 24: price24k };
    const goldRate = rateMap[product.karat] || price22k;
    const images = product.images?.length ? product.images : [null];
    const related = products.filter((item) => item._id !== product._id).slice(0, 4);

    /* ── Price breakdown ──────────────────────────────────────── */
    const goldValue = product.metal_type === 'gold' ? goldRate * product.weight : 0;
    const makingAmt = product.making_charges;
    const stoneValue = product.stones?.reduce((sum, stone) => sum + Number(stone.price || 0), 0) || 0;
    const subtotal = goldValue + makingAmt + stoneValue;
    const gstAmt = subtotal * 0.03;
    const totalPrice = calculateDisplayPrice(product, goldRate);

    const handleAddToCart = () => {
        addItem({
            ...product,
            quantity,
            base_price: totalPrice,
            price: totalPrice,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
    };

    return (
        <div className="pd-page">

            {/* ── Breadcrumb ── */}
            <div className="pd-breadcrumb">
                <div className="pd-breadcrumb__inner">
                    <Link to="/" className="pd-bc-link">Home</Link>
                    <ChevronRight size={13} className="pd-bc-sep" />
                    <Link to="/products" className="pd-bc-link">Collections</Link>
                    <ChevronRight size={13} className="pd-bc-sep" />
                    <span className="pd-bc-current">{product.name}</span>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="pd-main">

                {/* ═══ LEFT — Image gallery ═══ */}
                <div className="pd-gallery">

                    {/* Thumbnails */}
                    <div className="pd-thumbs">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                className={`pd-thumb ${activeImg === i ? 'pd-thumb--active' : ''}`}
                                onClick={() => setActiveImg(i)}
                            >
                                <div className="pd-thumb__placeholder">
                                    <Sparkles size={14} />
                                </div>
                            </button>
                        ))}
                    </div>

                        {/* Main image */}
                        <div className="pd-image-main">
                        {imageUrl(images[activeImg]) ? (
                            <img src={imageUrl(images[activeImg])} alt={product.name} className="pd-real-img" />
                        ) : (
                            <div className="pd-image-placeholder">
                                <Sparkles size={48} />
                                <span>Image {activeImg + 1}</span>
                            </div>
                        )}
                        {product.tag && <span className="pd-image-tag">{product.tag}</span>}

                        {/* Wishlist + Share */}
                        <div className="pd-image-actions">
                            <button
                                className={`pd-icon-btn ${wishlisted ? 'pd-icon-btn--active' : ''}`}
                                onClick={() => setWishlisted(p => !p)}
                                aria-label="Wishlist"
                            >
                                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                            </button>
                            <button className="pd-icon-btn" aria-label="Share">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT — Product info ═══ */}
                <div className="pd-info">

                    {/* Name & meta */}
                    <div className="pd-info__header">
                        <span className="pd-category">{product.categoryLabel}</span>
                        <h1 className="pd-name">{product.name}</h1>
                        <div className="pd-meta-row">
                            <span className="pd-meta-pill">{product.metal}</span>
                            <span className="pd-meta-pill">BIS Hallmarked</span>
                            <span className="pd-meta-pill">{product.weight}g</span>
                        </div>
                    </div>

                    {/* ── Price Breakdown ── */}
                    <div className="pd-price-box">
                        <div className="pd-price-box__header">
                            <span className="pd-price-box__label">Live Price Breakdown</span>
                            <span className="pd-price-box__rate">
                                Gold Rate: <strong>{fmt(goldRate)}/g</strong>
                            </span>
                        </div>

                        <div className="pd-price-rows">
                            <div className="pd-price-row">
                                <span>Gold Value</span>
                                <span>{product.weight}g × {fmt(goldRate)}</span>
                                <span>{fmt(goldValue)}</span>
                            </div>
                            <div className="pd-price-row">
                                <span>Making Charges</span>
                                <span>Crafting charge</span>
                                <span>{fmt(makingAmt)}</span>
                            </div>
                            {stoneValue > 0 && (
                                <div className="pd-price-row">
                                    <span>Stone Value</span>
                                    <span>Gemstone / diamond charges</span>
                                    <span>{fmt(stoneValue)}</span>
                                </div>
                            )}
                            <div className="pd-price-row pd-price-row--sub">
                                <span>Subtotal</span>
                                <span></span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            <div className="pd-price-row">
                                <span>GST</span>
                                <span>3%</span>
                                <span>{fmt(gstAmt)}</span>
                            </div>
                        </div>

                        <div className="pd-price-total">
                            <span>Total Price</span>
                            <span>{fmt(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="pd-description">{product.description || 'A handcrafted jewellery piece made with careful detailing and transparent pricing.'}</p>

                    {/* Highlights */}
                    <ul className="pd-highlights">
                        {[
                            'BIS Hallmarked',
                            `${product.metal} craftsmanship`,
                            product.stock > 0 ? 'Available in stock' : 'Currently out of stock',
                            'Comes in branded gift box',
                        ].map(h => (
                            <li key={h} className="pd-highlight">
                                <span className="pd-highlight-dot" />
                                {h}
                            </li>
                        ))}
                    </ul>

                    {/* ── Quantity + Add to cart ── */}
                    <div className="pd-actions">
                        <div className="pd-qty">
                            <button
                                className="pd-qty__btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="pd-qty__val">{quantity}</span>
                            <button
                                className="pd-qty__btn"
                                onClick={() => setQuantity(q => q + 1)}
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <button
                            className={`pd-add-btn ${added ? 'pd-add-btn--added' : ''}`}
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            {product.stock <= 0 ? (
                                'Out of Stock'
                            ) : added ? (
                                '✓ Added to Cart'
                            ) : (
                                <><ShoppingBag size={18} /> Add to Cart</>
                            )}
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="pd-trust">
                        {[
                            { icon: <Shield size={18} />, text: 'BIS Hallmarked' },
                            { icon: <Truck size={18} />, text: 'Free Insured Shipping' },
                            { icon: <RotateCcw size={18} />, text: '15-Day Returns' },
                        ].map(({ icon, text }) => (
                            <div key={text} className="pd-trust-item">
                                <span className="pd-trust-icon">{icon}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Related Products ── */}
            <section className="pd-related">
                <div className="pd-related__inner">
                    <div className="pd-related__header">
                        <span className="pd-related__label">You May Also Like</span>
                        <h2 className="pd-related__title">Similar Pieces</h2>
                    </div>
                    <div className="pd-related__grid">
                        {related.map(p => (
                            <Link to={`/products/${p._id}`} key={p._id} className="pd-rc">
                                <div className="pd-rc__img">
                                    {p.primaryImage ? (
                                        <img src={p.primaryImage} alt={p.name} className="pd-real-img" />
                                    ) : (
                                        <div className="pd-rc__placeholder"><Sparkles size={22} /></div>
                                    )}
                                    {p.tag && <span className="pd-rc__tag">{p.tag}</span>}
                                </div>
                                <div className="pd-rc__info">
                                    <span className="pd-rc__name">{p.name}</span>
                                    <span className="pd-rc__meta">{p.metal} · {p.weight}g</span>
                                    <span className="pd-rc__price">{fmt(calculateDisplayPrice(p, price22k))}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
