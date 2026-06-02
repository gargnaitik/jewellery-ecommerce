import useGoldStore from '../../store/gold.store';
import './Navbar.css';


/* ═══════════════════════════════════════════════════════════════
   Gold Ticker Strip
   ═══════════════════════════════════════════════════════════════ */
export default function GoldRateTicker() {
    const { price18k, price22k, price24k } = useGoldStore();

    const fallback22k = price22k || 7243;
    const fallback24k = price24k || fallback22k * 1.09;
    const fallback18k = price18k || fallback22k * 0.818;

    const items = [
        `22K Gold  ₹${Math.round(fallback22k).toLocaleString('en-IN')}/g`,
        `24K Gold  ₹${Math.round(fallback24k).toLocaleString('en-IN')}/g`,
        `18K Gold  ₹${Math.round(fallback18k).toLocaleString('en-IN')}/g`,
        'Free Shipping on ₹10,000+',
        'BIS Hallmarked Jewellery',
    ];

    return (
        <div className="gold-ticker" aria-label="Gold rate ticker">
            <div className="gold-ticker__track">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="gold-ticker__item">
                        <span className="gold-ticker__diamond">◆</span>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
