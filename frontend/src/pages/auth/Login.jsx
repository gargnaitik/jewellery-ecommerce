import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    /* ── Validation ─────────────────────────────────────────────── */
    const validate = () => {
        const e = {};
        if (!form.email.trim())
            e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Enter a valid email address';

        if (!form.password)
            e.password = 'Password is required';
        else if (form.password.length < 6)
            e.password = 'Password must be at least 6 characters';

        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        setApiError('');
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setApiError(err?.response?.data?.message || 'Invalid email or password');
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
                            Crafted with<br />
                            <em>Love & Gold</em>
                        </h2>
                        <p className="auth-panel__text">
                            Sign in to access your wishlist, track orders, and shop exclusive collections with live gold pricing.
                        </p>
                        <div className="auth-panel__features">
                            {['Live MCX Gold Rates', 'BIS 916 Hallmarked', 'Insured Delivery', '15-Day Returns'].map((f) => (
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

                    {/* Header */}
                    <div className="auth-form-header">
                        <Link to="/" className="auth-back-logo">
                            <span className="auth-logo-word">Kanakam</span>
                        </Link>
                        <h1 className="auth-form-title">Welcome back</h1>
                        <p className="auth-form-sub">Sign in to your account</p>
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="auth-alert auth-alert--error">
                            {apiError}
                        </div>
                    )}

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>

                        {/* Email */}
                        <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="login-email">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Mail size={16} /></span>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="auth-input"
                                />
                            </div>
                            {errors.email && <span className="auth-error">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
                            <div className="auth-label-row">
                                <label className="auth-label" htmlFor="login-password">Password</label>
                                <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
                            </div>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Lock size={16} /></span>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowPass((p) => !p)}
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <span className="auth-error">{errors.password}</span>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="auth-spinner" />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider"><span>or</span></div>

                    {/* Register link */}
                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-switch-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
