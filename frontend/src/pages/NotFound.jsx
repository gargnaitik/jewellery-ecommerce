import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep, #0c0b09)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 24px',
            fontFamily: "'Jost', sans-serif",
            color: 'var(--text-primary, #f0e6d3)',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Subtle radial glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,165,90,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Spinning ornament ring */}
            <div style={{
                position: 'absolute',
                width: 460,
                height: 460,
                borderRadius: '50%',
                border: '1px solid rgba(201,165,90,0.12)',
                animation: 'spin 50s linear infinite',
            }} />
            <div style={{
                position: 'absolute',
                width: 340,
                height: 340,
                borderRadius: '50%',
                border: '1px solid rgba(201,165,90,0.08)',
                animation: 'spin 35s linear infinite reverse',
            }} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Jost:wght@300;400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
                .nf-cta { display:inline-flex; align-items:center; gap:10px; font-family:'Jost',sans-serif; font-size:11px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; text-decoration:none; padding:14px 32px; border:1px solid rgba(201,165,90,0.4); color:#C9A55A; transition:background .25s,color .25s,transform .25s; }
                .nf-cta:hover { background:#C9A55A; color:#0c0b09; transform:translateY(-2px); }
                .nf-cta--filled { background:#C9A55A; color:#0c0b09; border-color:#C9A55A; }
                .nf-cta--filled:hover { background:#E2C27D; border-color:#E2C27D; color:#0c0b09; }
            `}</style>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp .8s ease both' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#C9A55A', marginBottom: 24 }}>
                    ERROR — PAGE NOT FOUND
                </p>
                <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(80px, 15vw, 160px)',
                    fontWeight: 600,
                    color: '#C9A55A',
                    lineHeight: 1,
                    marginBottom: 0,
                    letterSpacing: '-0.02em',
                }}>
                    404
                </h1>
                <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(22px, 4vw, 36px)',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: 'var(--text-primary, #f0e6d3)',
                    marginTop: 12,
                    marginBottom: 16,
                }}>
                    This page seems lost
                </h2>
                <p style={{ fontSize: 14, fontWeight: 300, color: '#8a7d6a', maxWidth: 420, margin: '0 auto 42px', lineHeight: 1.75, letterSpacing: '0.02em' }}>
                    The page you're looking for doesn't exist or may have been moved. Let's guide you back to our collection.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="nf-cta nf-cta--filled">← Back to Home</Link>
                    <Link to="/products" className="nf-cta">Browse Collections</Link>
                </div>
            </div>
        </div>
    );
}
