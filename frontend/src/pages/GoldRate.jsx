import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, RefreshCw, ArrowRight, Info } from 'lucide-react';
import useGoldStore from '../store/gold.store';
import './GoldRate.css';

const KARATS = [
    { label: '24K Gold', subtitle: '999.9 Pure • Investment Grade', key: 'price24k', karat: 24 },
    { label: '22K Gold', subtitle: '916 Hallmarked • Jewellery Standard', key: 'price22k', karat: 22, badge: 'Most Popular' },
    { label: '18K Gold', subtitle: '750 Purity • Modern Jewellery', key: 'price18k', karat: 18 },
];

const CALC_KARATS = [14, 18, 22, 24];

export default function GoldRate() {
    const { price22k, price24k, price18k, price14k, silverPrice, change, loading, lastUpdated, fetchRate } = useGoldStore();

    const [refreshing, setRefreshing] = useState(false);
    // Price calculator state
    const [calcWeight, setCalcWeight] = useState('');
    const [calcKarat, setCalcKarat] = useState(22);
    const [calcMaking, setCalcMaking] = useState('');

    const rateMap = { 24: price24k, 22: price22k, 18: price18k, 14: price14k ?? 0 };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRate();
        setTimeout(() => setRefreshing(false), 800);
    };

    // Price calculator
    const goldValue = calcWeight && rateMap[calcKarat] ? parseFloat(calcWeight) * rateMap[calcKarat] : 0;
    const makingCharges = parseFloat(calcMaking) || 0;
    const gstAmount = (goldValue + makingCharges) * 0.03;
    const totalPrice = goldValue + makingCharges + gstAmount;

    const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

    const isUp = change >= 0;

    return (
        <div className="gr-page">
            {/* ── Hero ────────────────────────────────────────────── */}
            <section className="gr-hero">
                <div className="gr-hero__glow" />
                <div className="gr-hero__inner">
                    <p className="gr-hero__label">Live MCX Rates</p>
                    <h1 className="gr-hero__title">
                        Today's <em>Gold Rate</em>
                    </h1>
                    <p className="gr-hero__sub">
                        Live gold prices sourced from MCX. Updated every 15 minutes.
                    </p>

                    {/* 22K headline rate */}
                    <div className="gr-hero__rate-card">
                        <div>
                            <span className="gr-hero__rate-label">22K Gold / gram</span>
                            <div className="gr-hero__rate-value">
                                {loading ? '—' : formatINR(price22k)}
                            </div>
                        </div>
                        <div className={`gr-hero__change ${isUp ? 'gr-hero__change--up' : 'gr-hero__change--down'}`}>
                            {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            <span>{isUp ? '+' : ''}{change?.toFixed(2) ?? '0.00'}%</span>
                            <span className="gr-hero__change-label">today</span>
                        </div>
                    </div>

                    <div className="gr-hero__meta">
                        <span>Last updated: {formatTime(lastUpdated)}</span>
                        <button className={`gr-refresh-btn ${refreshing ? 'gr-refresh-btn--spinning' : ''}`} onClick={handleRefresh} aria-label="Refresh rates">
                            <RefreshCw size={15} /> Refresh
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Rate Cards Grid ──────────────────────────────────── */}
            <section className="gr-section">
                <div className="gr-inner">
                    <p className="gr-section__label">All Karats</p>
                    <h2 className="gr-section__title">Gold Rate by Purity</h2>

                    <div className="gr-rate-grid">
                        {KARATS.map(({ label, subtitle, key, badge }) => {
                            const rateMap2 = { price22k, price24k, price18k };
                            const rate = rateMap2[key];
                            return (
                                <div key={key} className={`gr-rate-card ${badge ? 'gr-rate-card--featured' : ''}`}>
                                    {badge && <span className="gr-rate-card__badge">{badge}</span>}
                                    <h3 className="gr-rate-card__label">{label}</h3>
                                    <p className="gr-rate-card__sub">{subtitle}</p>
                                    <div className="gr-rate-card__price">
                                        {loading ? '…' : formatINR(rate)}
                                        <span className="gr-rate-card__unit">/gram</span>
                                    </div>
                                    <div className={`gr-rate-card__change ${isUp ? 'up' : 'down'}`}>
                                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {isUp ? '+' : ''}{change?.toFixed(2) ?? '0'}% today
                                    </div>
                                </div>
                            );
                        })}

                        {/* Silver card */}
                        <div className="gr-rate-card gr-rate-card--silver">
                            <h3 className="gr-rate-card__label">Silver</h3>
                            <p className="gr-rate-card__sub">999 Fine • Jewellery & Coins</p>
                            <div className="gr-rate-card__price">
                                {loading ? '…' : formatINR(silverPrice)}
                                <span className="gr-rate-card__unit">/gram</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Price Calculator ─────────────────────────────────── */}
            <section className="gr-section gr-section--alt">
                <div className="gr-inner">
                    <p className="gr-section__label">Price Estimator</p>
                    <h2 className="gr-section__title">Calculate Jewellery Cost</h2>
                    <p className="gr-section__sub">
                        Estimate the price of your jewellery based on current gold rates. This is indicative — final price may vary.
                    </p>

                    <div className="gr-calc">
                        <div className="gr-calc__inputs">
                            <div className="gr-calc__field">
                                <label className="gr-calc__label">Gold Karat</label>
                                <div className="gr-calc__karat-grid">
                                    {CALC_KARATS.map(k => (
                                        <button
                                            key={k}
                                            onClick={() => setCalcKarat(k)}
                                            className={`gr-calc__karat-btn ${calcKarat === k ? 'active' : ''}`}
                                        >
                                            {k}K
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gr-calc__field">
                                <label className="gr-calc__label" htmlFor="calc-weight">Net Weight (grams)</label>
                                <input
                                    id="calc-weight"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={calcWeight}
                                    onChange={e => setCalcWeight(e.target.value)}
                                    placeholder="e.g. 8.5"
                                    className="gr-calc__input"
                                />
                            </div>
                            <div className="gr-calc__field">
                                <label className="gr-calc__label" htmlFor="calc-making">Making Charges (₹)</label>
                                <input
                                    id="calc-making"
                                    type="number"
                                    min="0"
                                    value={calcMaking}
                                    onChange={e => setCalcMaking(e.target.value)}
                                    placeholder="e.g. 1500"
                                    className="gr-calc__input"
                                />
                            </div>
                        </div>

                        <div className="gr-calc__result">
                            <div className="gr-calc__result-title">Estimated Price</div>
                            <div className="gr-calc__breakdown">
                                <div className="gr-calc__row">
                                    <span>Gold Value ({calcKarat}K × {calcWeight || 0}g @ {formatINR(rateMap[calcKarat])}/g)</span>
                                    <span>{formatINR(goldValue)}</span>
                                </div>
                                <div className="gr-calc__row">
                                    <span>Making Charges</span>
                                    <span>{formatINR(makingCharges)}</span>
                                </div>
                                <div className="gr-calc__row">
                                    <span>GST (3%)</span>
                                    <span>{formatINR(gstAmount)}</span>
                                </div>
                                <div className="gr-calc__row gr-calc__row--total">
                                    <span>Total Estimate</span>
                                    <span>{formatINR(totalPrice)}</span>
                                </div>
                            </div>
                            <p className="gr-calc__disclaimer">
                                <Info size={12} /> Prices are indicative based on live MCX rates. Stone value not included.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────── */}
            <section className="gr-cta-section">
                <div className="gr-inner gr-cta-inner">
                    <h2 className="gr-cta__title">
                        Shop at <em>Today's Rate</em>
                    </h2>
                    <p className="gr-cta__sub">All prices on Kanakam are calculated live from MCX gold rates — no hidden margins.</p>
                    <Link to="/products" className="gr-cta__btn">
                        Browse Collections <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
