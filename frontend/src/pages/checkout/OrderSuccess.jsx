import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Sparkles, Home } from 'lucide-react';
import './OrderSuccess.css';

const FALLBACK_ORDER = {
    orderId: 'ORD-PREVIEW',
    paymentId: 'pay_preview',
    total: 0,
    items: [],
};

export default function OrderSuccess() {
    const location = useLocation();
    const confettiRef = useRef(false);

    /* ── Pull data passed from Checkout on success ── */
    const {
        orderId,
        paymentId,
        total,
        items,
    } = location.state || FALLBACK_ORDER;

    const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    /* ── Redirect if landed without state ── */
    useEffect(() => {
        if (!location.state) {
            // Uncomment to auto-redirect if no state (direct URL hit):
            // navigate('/', { replace: true });
        }
    }, [location.state]);

    /* ── Gold particle burst animation ── */
    useEffect(() => {
        if (confettiRef.current) return;
        confettiRef.current = true;

        const container = document.getElementById('os-particles');
        if (!container) return;

        for (let i = 0; i < 36; i++) {
            const p = document.createElement('div');
            p.className = 'os-particle';
            p.style.cssText = `
        left: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 0.8}s;
        animation-duration: ${1.2 + Math.random() * 1.2}s;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        opacity: ${0.4 + Math.random() * 0.6};
      `;
            container.appendChild(p);
        }
    }, []);

    /* ── Estimated delivery (5–7 working days) ── */
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 7);
    const deliveryStr = delivery.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
    });

    return (
        <div className="os-page">
            {/* Gold particle burst */}
            <div id="os-particles" className="os-particles" aria-hidden="true" />

            <div className="os-card">

                {/* ── Success icon ── */}
                <div className="os-icon-wrap">
                    <div className="os-icon-ring os-icon-ring--outer" />
                    <div className="os-icon-ring os-icon-ring--inner" />
                    <div className="os-icon">
                        <CheckCircle2 size={40} strokeWidth={1.5} />
                    </div>
                </div>

                {/* ── Heading ── */}
                <div className="os-header">
                    <span className="os-eyebrow">
                        <Sparkles size={12} /> Order Confirmed
                    </span>
                    <h1 className="os-title">Thank You!</h1>
                    <p className="os-subtitle">
                        Your order has been placed and is being prepared with care.
                    </p>
                </div>

                {/* ── Order details ── */}
                <div className="os-details">
                    <div className="os-detail-row">
                        <span className="os-detail-label">Order ID</span>
                        <span className="os-detail-value os-detail-value--mono">{orderId}</span>
                    </div>
                    <div className="os-detail-row">
                        <span className="os-detail-label">Payment ID</span>
                        <span className="os-detail-value os-detail-value--mono">{paymentId}</span>
                    </div>
                    <div className="os-detail-row">
                        <span className="os-detail-label">Amount Paid</span>
                        <span className="os-detail-value os-detail-value--gold">{fmt(total)}</span>
                    </div>
                    <div className="os-detail-row">
                        <span className="os-detail-label">Est. Delivery</span>
                        <span className="os-detail-value">{deliveryStr}</span>
                    </div>
                </div>

                {/* ── Items summary ── */}
                <div className="os-items">
                    <h3 className="os-items__heading">
                        <Package size={15} /> Items in this order
                    </h3>
                    {items.map((item) => (
                        <div key={item._id} className="os-item">
                            <div className="os-item__img">
                                <Sparkles size={14} />
                                {/* swap with: <img src={item.image} alt={item.name} /> */}
                            </div>
                            <div className="os-item__info">
                                <span className="os-item__name">{item.name}</span>
                                <span className="os-item__meta">{item.metal} · Qty {item.quantity}</span>
                            </div>
                            <span className="os-item__price">{fmt(Number(item.base_price ?? item.price ?? 0) * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {/* ── What's next ── */}
                <div className="os-next">
                    <h3 className="os-next__heading">What happens next?</h3>
                    <div className="os-steps">
                        {[
                            { n: '01', title: 'Order Processing', text: 'We verify your order and begin quality inspection (1–2 days).' },
                            { n: '02', title: 'Dispatch', text: 'Your jewellery is packed in a branded, insured box and shipped.' },
                            { n: '03', title: 'Delivery', text: `Expected by ${deliveryStr}. You'll receive tracking updates via SMS.` },
                        ].map(({ n, title, text }) => (
                            <div key={n} className="os-step">
                                <span className="os-step__num">{n}</span>
                                <div className="os-step__body">
                                    <span className="os-step__title">{title}</span>
                                    <span className="os-step__text">{text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="os-actions">
                    <Link to="/orders" className="os-orders-btn">
                        <Package size={16} /> Track My Order
                    </Link>
                    <Link to="/" className="os-home-btn">
                        <Home size={16} /> Back to Home
                    </Link>
                </div>

                {/* ── Footer note ── */}
                <p className="os-note">
                    A confirmation email has been sent to your registered email address.
                    For queries, contact{' '}
                    <a href="mailto:support@kanakam.in" className="os-note-link">
                        support@kanakam.in
                    </a>
                </p>
            </div>
        </div>
    );
}
