import useGoldStore from '../../store/gold.store';
import './Navbar.css';


/* ═══════════════════════════════════════════════════════════════
   Gold Ticker Strip
   ═══════════════════════════════════════════════════════════════ */
export default function GoldRateTicker() {
    const { rates } = useGoldStore();

    /* Fallback mock data when API isn't connected yet */
    const price22k = rates?.['22K'] ?? 7243;
    const price24k = rates?.['24K'] ?? (7243 * 1.09);
    const price18k = rates?.['18K'] ?? (7243 * 0.78);

    const items = [
        `22K Gold  ₹${Math.round(price22k).toLocaleString('en-IN')}/g`,
        `24K Gold  ₹${Math.round(price24k).toLocaleString('en-IN')}/g`,
        `18K Gold  ₹${Math.round(price18k).toLocaleString('en-IN')}/g`,
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
