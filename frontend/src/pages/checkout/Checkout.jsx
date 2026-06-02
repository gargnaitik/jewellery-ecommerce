import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight, MapPin, Phone, User,
    Building2, Lock, Sparkles, CheckCircle2
} from 'lucide-react';

import useCartStore from '../../store/cart.store';
import useAuthStore from '../../store/auth.store';
import { createOrder } from '../../services/order.service';
import { initiatePayment, verifyPayment } from '../../services/payment.service';
import './Checkout.css';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const GST = 0.03;
const FREE_SHIPPING = 10000;

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh',
];

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });
}

const STEPS = ['Address', 'Review', 'Payment'];
function StepBar({ current }) {
    return (
        <div className="step-bar">
            {STEPS.map((s, i) => (
                <div key={s} className={`step ${i < current ? 'step--done' : i === current ? 'step--active' : ''}`}>
                    <div className="step__circle">
                        {i < current ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                    </div>
                    <span className="step__label">{s}</span>
                    {i < STEPS.length - 1 && <div className="step__line" />}
                </div>
            ))}
        </div>
    );
}

function OrderSummary({ items, subtotal, gst, shipping, total }) {
    return (
        <aside className="co-summary">
            <h3 className="co-summary__title">Order Summary</h3>
            <div className="co-summary__items">
                {items.map((item) => (
                    <div key={item._id} className="co-sum-item">
                        <div className="co-sum-item__img"><Sparkles size={14} /></div>
                        <div className="co-sum-item__info">
                            <span className="co-sum-item__name">{item.name}</span>
                            <span className="co-sum-item__meta">{item.metal} · Qty {item.quantity}</span>
                        </div>
                        <span className="co-sum-item__price">{fmt(Number(item.base_price ?? item.price ?? 0) * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="co-summary__rows">
                <div className="co-sum-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="co-sum-row"><span>GST (3%)</span><span>{fmt(gst)}</span></div>
                <div className="co-sum-row">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'co-free' : ''}>
                        {shipping === 0 ? 'Free' : fmt(shipping)}
                    </span>
                </div>
            </div>
            <div className="co-sum-total"><span>Total</span><span>{fmt(total)}</span></div>
            <p className="co-sum-trust"><Lock size={12} /> Secured by Razorpay · 256-bit SSL</p>
        </aside>
    );
}

function Field({ label, name, value, onChange, error, placeholder, icon, prefix, maxLength }) {
    return (
        <div className={`co-field ${error ? 'co-field--error' : ''}`}>
            <label className="co-label" htmlFor={`co-${name}`}>{label}</label>
            <div className="co-input-wrap">
                {icon && <span className="co-input-icon">{icon}</span>}
                {prefix && <span className="co-prefix">{prefix}</span>}
                <input
                    id={`co-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    autoComplete="off"
                    className={`co-input ${icon ? 'co-input--icon' : ''} ${prefix ? 'co-input--prefix' : ''}`}
                />
            </div>
            {error && <span className="co-error">{error}</span>}
        </div>
    );
}

export default function Checkout() {
    const navigate = useNavigate();
    const { items, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        line1: '', line2: '', city: '', state: '', pincode: '',
    });

    const subtotal = items.reduce((s, i) => s + Number(i.base_price ?? i.price ?? 0) * i.quantity, 0);
    const gst = subtotal * GST;
    const shipping = subtotal >= FREE_SHIPPING ? 0 : 299;
    const total = subtotal + gst + shipping;

    const validate = () => {
        const e = {};
        if (!address.fullName.trim()) e.fullName = 'Full name is required';
        if (!/^[6-9]\d{9}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit number';
        if (!address.line1.trim()) e.line1 = 'Address line 1 is required';
        if (!address.city.trim()) e.city = 'City is required';
        if (!address.state) e.state = 'Please select a state';
        if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
        setApiError('');
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePayment = async () => {
        setLoading(true);
        setStep(2);
        setApiError('');

        try {
            /* 1 — Load Razorpay SDK */
            const loaded = await loadRazorpay();
            if (!loaded) throw new Error('Razorpay SDK failed to load.');

            /* 2 — POST /api/orders */
            const { data: orderResponse } = await createOrder({
                items: items.map((i) => ({
                    product_id: i._id,
                    quantity: i.quantity,
                })),
                shipping_address: {
                    name: address.fullName,
                    phone: address.phone,
                    street: [address.line1, address.line2].filter(Boolean).join(', '),
                    city: address.city,
                    state: address.state,
                    postal_code: address.pincode,
                    country: 'India',
                },
            });
            const order = orderResponse.data || orderResponse.order || orderResponse;

            /* 3 — POST /api/payments/initiate */
            const { data: paymentResponse } = await initiatePayment(order.id || order._id);
            const payment = paymentResponse.data || paymentResponse;

            /* 4 — Open Razorpay */
            const options = {
                key: payment.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: payment.amount,
                currency: payment.currency || 'INR',
                name: 'Kanakam Fine Jewellery',
                description: `Order #${order.id || order._id}`,
                order_id: payment.razorpay_order_id,
                prefill: {
                    name: address.fullName,
                    email: user?.email || '',
                    contact: address.phone,
                },
                notes: {
                    orderId: order.id || order._id,
                    address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`,
                },
                theme: { color: '#C9A55A' },

                handler: async (response) => {
                    try {
                        /* 5 — POST /api/payments/verify */
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: order.id || order._id,
                        });

                        /* 6 — Clear + navigate */
                        clearCart();
                        navigate('/order-success', {
                            state: {
                                orderId: order.id || order._id,
                                paymentId: response.razorpay_payment_id,
                                total: order.total_amount || total,
                                items,
                            },
                        });
                    } catch (err) {
                        setApiError(
                            err?.response?.data?.message ||
                            'Payment received but verification failed. Please contact support.'
                        );
                        setLoading(false);
                        setStep(1);
                    }
                },

                modal: {
                    ondismiss: () => { setLoading(false); setStep(1); },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setApiError(`Payment failed: ${resp.error.description}`);
                setLoading(false);
                setStep(1);
            });
            rzp.open();

        } catch (err) {
            setApiError(err?.response?.data?.message || err?.message || 'Something went wrong.');
            setLoading(false);
            setStep(1);
        }
    };

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: 'Jost, sans-serif' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your cart is empty.</p>
                <Link to="/products" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                    Browse Collections →
                </Link>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="co-breadcrumb">
                <div className="co-breadcrumb__inner">
                    <Link to="/" className="co-bc-link">Home</Link>
                    <ChevronRight size={13} className="co-bc-sep" />
                    <Link to="/cart" className="co-bc-link">Cart</Link>
                    <ChevronRight size={13} className="co-bc-sep" />
                    <span className="co-bc-cur">Checkout</span>
                </div>
            </div>

            <div className="co-inner">
                <div className="co-main">
                    <StepBar current={step} />

                    {/* API error banner */}
                    {apiError && <div className="co-api-error">{apiError}</div>}

                    {/* ══ STEP 0 — Address ══ */}
                    {step === 0 && (
                        <form className="co-form" onSubmit={handleAddressSubmit} noValidate>
                            <div className="co-form__section">
                                <h2 className="co-form__heading"><MapPin size={18} /> Delivery Address</h2>
                                <div className="co-form__row co-form__row--2">
                                    <Field label="Full Name" name="fullName" icon={<User size={15} />} value={address.fullName} onChange={handleChange} error={errors.fullName} placeholder="Priya Sharma" />
                                    <Field label="Mobile Number" name="phone" icon={<Phone size={15} />} value={address.phone} onChange={handleChange} error={errors.phone} placeholder="9876543210" prefix="+91" maxLength={10} />
                                </div>
                                <Field label="Address Line 1" name="line1" icon={<Building2 size={15} />} value={address.line1} onChange={handleChange} error={errors.line1} placeholder="House / Flat no., Building, Street" />
                                <Field label="Address Line 2" name="line2" value={address.line2} onChange={handleChange} placeholder="Area, Locality (optional)" />
                                <div className="co-form__row co-form__row--3">
                                    <Field label="City" name="city" value={address.city} onChange={handleChange} error={errors.city} placeholder="Mumbai" />
                                    <div className={`co-field ${errors.state ? 'co-field--error' : ''}`}>
                                        <label className="co-label" htmlFor="co-state">State</label>
                                        <div className="co-input-wrap">
                                            <select id="co-state" name="state" value={address.state} onChange={handleChange} className="co-select">
                                                <option value="">Select state</option>
                                                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        {errors.state && <span className="co-error">{errors.state}</span>}
                                    </div>
                                    <Field label="Pincode" name="pincode" value={address.pincode} onChange={handleChange} error={errors.pincode} placeholder="400001" maxLength={6} />
                                </div>
                            </div>
                            <button type="submit" className="co-next-btn">
                                Continue to Review <ChevronRight size={16} />
                            </button>
                        </form>
                    )}

                    {/* ══ STEP 1 — Review ══ */}
                    {step === 1 && (
                        <div className="co-review">
                            <div className="co-review__block">
                                <div className="co-review__block-header">
                                    <h3><MapPin size={16} /> Delivering to</h3>
                                    <button className="co-edit-btn" onClick={() => setStep(0)}>Edit</button>
                                </div>
                                <div className="co-address-card">
                                    <p className="co-address-card__name">{address.fullName}</p>
                                    <p className="co-address-card__line">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                                    <p className="co-address-card__line">{address.city}, {address.state} – {address.pincode}</p>
                                    <p className="co-address-card__phone">+91 {address.phone}</p>
                                </div>
                            </div>

                            <div className="co-review__block">
                                <div className="co-review__block-header">
                                    <h3><Sparkles size={16} /> {items.length} item(s) in your order</h3>
                                </div>
                                {items.map((item) => (
                                    <div key={item._id} className="co-review-item">
                                        <div className="co-review-item__img"><Sparkles size={16} /></div>
                                        <div className="co-review-item__info">
                                            <span className="co-review-item__name">{item.name}</span>
                                            <span className="co-review-item__meta">{item.metal} · {item.weight}g · Qty {item.quantity}</span>
                                        </div>
                                        <span className="co-review-item__price">{fmt(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`co-pay-btn ${loading ? 'co-pay-btn--loading' : ''}`}
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading
                                    ? <><span className="co-spinner" /> Opening Payment…</>
                                    : <><Lock size={16} /> Pay {fmt(total)} Securely</>
                                }
                            </button>
                            <p className="co-pay-note">
                                You'll be redirected to Razorpay. UPI · Cards · Net Banking · Wallets accepted.
                            </p>
                        </div>
                    )}

                    {/* ══ STEP 2 — Processing ══ */}
                    {step === 2 && (
                        <div className="co-processing">
                            <div className="co-processing__spinner" />
                            <p className="co-processing__text">Opening secure payment…</p>
                        </div>
                    )}
                </div>

                <OrderSummary items={items} subtotal={subtotal} gst={gst} shipping={shipping} total={total} />
            </div>
        </div>
    );
}
