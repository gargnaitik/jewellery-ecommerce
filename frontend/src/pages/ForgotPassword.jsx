import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/auth.service';
import './auth/Auth.css'; // Reuse existing auth styles

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        if (!email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }

        setLoading(true);
        setError('');
        try {
            await forgotPassword(email.toLowerCase().trim());
            toast.success('OTP sent to your email');
            setSent(true);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* ── Left decorative panel ── */}
            <div className="auth-panel">
                <div className="auth-panel__inner">
                    <div className="auth-panel__ornament" />
                    <div className="auth-panel__content">
                        <span className="auth-panel__label">
                            <Sparkles size={12} /> Kanakam Fine Jewellery
                        </span>
                        <h2 className="auth-panel__title">
                            We've got<br />
                            <em>you covered</em>
                        </h2>
                        <p className="auth-panel__text">
                            Forgot your password? No worries — we'll send a secure OTP to your registered email address.
                        </p>
                        <div className="auth-panel__features">
                            {['Secure OTP Verification', 'OTP expires in 10 mins', '256-bit Encryption', '24/7 Support'].map((f) => (
                                <span key={f} className="auth-panel__feature">
                                    <span className="auth-panel__dot" />
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="auth-form-panel">
                <div className="auth-form-wrap">
                    <div className="auth-form-header">
                        <Link to="/" className="auth-back-logo">
                            <span className="auth-logo-word">Kanakam</span>
                        </Link>
                        <h1 className="auth-form-title">
                            {sent ? 'OTP Sent!' : 'Forgot password?'}
                        </h1>
                        <p className="auth-form-sub">
                            {sent
                                ? `We've sent a 6-digit OTP to ${email}`
                                : "Enter your email and we'll send you a reset OTP"
                            }
                        </p>
                    </div>

                    {sent ? (
                        /* Success state — navigate to reset page */
                        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                            <CheckCircle
                                size={56}
                                style={{ color: '#C9A55A', margin: '0 auto 20px' }}
                            />
                            <p style={{ fontSize: 14, color: '#8a7d6a', lineHeight: 1.75, marginBottom: 32 }}>
                                Check your email inbox (and spam folder) for the OTP.
                            </p>
                            <button
                                onClick={() => navigate('/reset-password', { state: { email } })}
                                className="auth-submit"
                                style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                            >
                                Enter OTP & Reset Password <ArrowRight size={16} />
                            </button>
                            <p style={{ fontSize: 13, color: '#8a7d6a', marginTop: 16 }}>
                                Didn't receive it?{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    style={{ background: 'none', border: 'none', color: '#C9A55A', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}
                                >
                                    Resend OTP
                                </button>
                            </p>
                        </div>
                    ) : (
                        /* Form */
                        <>
                            {error && <div className="auth-alert auth-alert--error">{error}</div>}

                            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                                <div className={`auth-field ${error ? 'auth-field--error' : ''}`}>
                                    <label className="auth-label" htmlFor="forgot-email">Email Address</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Mail size={16} /></span>
                                        <input
                                            id="forgot-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="you@example.com"
                                            className="auth-input"
                                        />
                                    </div>
                                    {error && <span className="auth-error">{error}</span>}
                                </div>

                                <button
                                    type="submit"
                                    className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <span className="auth-spinner" />
                                        : <>Send OTP <ArrowRight size={16} /></>
                                    }
                                </button>
                            </form>

                            <div className="auth-divider"><span>or</span></div>

                            <p className="auth-switch">
                                <Link to="/login" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <ArrowLeft size={14} /> Back to Sign In
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
