import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import useCartStore from '../../store/cart.store';
import { imageUrl } from '../../utils/productAdapter';
import './CartDrawer.css';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const FREE_SHIPPING_THRESHOLD = 10000;
const GST_RATE = 0.03;

export default function CartDrawer() {
  const { isOpen, items, closeCart, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((s, i) => s + Number(i.base_price ?? i.price ?? 0) * i.quantity, 0);
  const gstAmt = subtotal * GST_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 299;
  const total = subtotal + gstAmt + shipping;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Fragment>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="cart-backdrop"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer ── */}
      <div className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} role="dialog" aria-label="Shopping cart">

        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <ShoppingBag size={18} />
            <span>Your Cart</span>
            {totalItems > 0 && (
              <span className="cart-drawer__count">{totalItems}</span>
            )}
          </div>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty__icon"><Sparkles size={40} /></div>
            <h3 className="cart-empty__title">Your cart is empty</h3>
            <p className="cart-empty__text">
              Discover our curated collections and add pieces you love.
            </p>
            <Link to="/products" className="cart-empty__btn" onClick={closeCart}>
              Explore Collections
            </Link>
          </div>
        )}

        {/* ── Items list ── */}
        {items.length > 0 && (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item._id} className="cart-item">

                  {/* Image placeholder */}
                  <div className="cart-item__img">
                    {imageUrl(item.images?.[0]) ? (
                      <img src={imageUrl(item.images[0])} alt={item.name} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="cart-item__info">
                    <h4 className="cart-item__name">{item.name}</h4>
                    <span className="cart-item__meta">
                      {item.metal} · {item.weight}g
                    </span>
                    <span className="cart-item__price">{fmt(Number(item.base_price ?? item.price ?? 0))}</span>
                  </div>

                  {/* Controls */}
                  <div className="cart-item__controls">
                    <div className="cart-item__qty">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item._id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order summary ── */}
            <div className="cart-summary">
              {shipping === 0 && (
                <div className="cart-shipping-badge">
                  🚚 Free insured shipping applied
                </div>
              )}
              {shipping > 0 && (
                <div className="cart-shipping-progress">
                  <span>Add {fmt(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</span>
                  <div className="shipping-bar">
                    <div
                      className="shipping-bar__fill"
                      style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>GST (3%)</span>
                  <span>{fmt(gstAmt)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'cart-free' : ''}>
                    {shipping === 0 ? 'Free' : fmt(shipping)}
                  </span>
                </div>
              </div>

              <div className="cart-summary__total">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>

              {/* Actions */}
              <div className="cart-actions">
                <Link
                  to="/checkout"
                  className="cart-checkout-btn"
                  onClick={closeCart}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
                <button className="cart-continue-btn" onClick={closeCart}>
                  Continue Shopping
                </button>
              </div>

              {/* Trust line */}
              <p className="cart-trust-line">
                🔒 Secure checkout · BIS Hallmarked · 15-day returns
              </p>
            </div>
          </>
        )}
      </div>
    </Fragment>
  );
}
