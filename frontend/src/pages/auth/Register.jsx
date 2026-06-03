import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/auth.store';
import './Auth.css';

/* ── Password strength scorer ───────────────────────────────── */
function getStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: 'Too short', color: '#e57373' },
        { label: 'Weak', color: '#e57373' },
        { label: 'Fair', color: '#ffb74d' },
        { label: 'Good', color: '#81c784' },
        { label: 'Strong', color: '#4caf50' },
    ];
    return { score, ...map[score] };
}

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();

    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const strength = getStrength(form.password);

    /* ── Validation ─────────────────────────────────────────────── */
    const validate = () => {
        const e = {};
        if (!form.name.trim())
            e.name = 'Full name is required';
        else if (form.name.trim().length < 2)
            e.name = 'Name must be at least 2 characters';

        if (!form.email.trim())
            e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Enter a valid email address';

        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
            e.phone = 'Enter a valid 10-digit Indian mobile number';

        if (!form.password)
            e.password = 'Password is required';
        else if (form.password.length < 6)
            e.password = 'Password must be at least 6 characters';

        if (!form.confirmPassword)
            e.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword)
            e.confirmPassword = 'Passwords do not match';

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
            await register({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
            });
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
            setApiError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page--register">
            {/* ── Left decorative panel ── */}
            <div className="auth-panel">
                <div className="auth-panel__inner">
                    <div className="auth-panel__ornament" />
                    <div className="auth-panel__content">
                        <span className="auth-panel__label">
                            <Sparkles size={12} /> Kanakam Fine Jewellery
                        </span>
                        <h2 className="auth-panel__title">
                            Begin Your<br />
                            <em>Golden Journey</em>
                        </h2>
                        <p className="auth-panel__text">
                            Create an account to enjoy personalised recommendations, exclusive member offers, and seamless checkout.
                        </p>
                        <div className="auth-panel__features">
                            {['Early access to new collections', 'Gold rate alerts on WhatsApp', 'Saved addresses & wishlists', 'Member-only discounts'].map((f) => (
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
                        <h1 className="auth-form-title">Create account</h1>
                        <p className="auth-form-sub">Join the Kanakam family</p>
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="auth-alert auth-alert--error">{apiError}</div>
                    )}

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>

                        {/* Name */}
                        <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="reg-name">Full Name</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><User size={16} /></span>
                                <input
                                    id="reg-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Priya Sharma"
                                    className="auth-input"
                                />
                            </div>
                            {errors.name && <span className="auth-error">{errors.name}</span>}
                        </div>

                        {/* Email */}
                        <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="reg-email">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Mail size={16} /></span>
                                <input
                                    id="reg-email"
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

                        {/* Phone */}
                        <div className={`auth-field ${errors.phone ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="reg-phone">
                                Mobile Number <span className="auth-label-optional">(optional)</span>
                            </label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Phone size={16} /></span>
                                <span className="auth-prefix">+91</span>
                                <input
                                    id="reg-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    className="auth-input auth-input--prefixed"
                                    maxLength={10}
                                />
                            </div>
                            {errors.phone && <span className="auth-error">{errors.phone}</span>}
                        </div>

                        {/* Password */}
                        <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="reg-password">Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Lock size={16} /></span>
                                <input
                                    id="reg-password"
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowPass((p) => !p)}
                                    aria-label="Toggle password"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {form.password && (
                                <div className="auth-strength">
                                    <div className="auth-strength-bar">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="auth-strength-seg"
                                                style={{ background: i <= strength.score ? strength.color : undefined }}
                                            />
                                        ))}
                                    </div>
                                    <span className="auth-strength-label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                            {errors.password && <span className="auth-error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className={`auth-field ${errors.confirmPassword ? 'auth-field--error' : ''}`}>
                            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Lock size={16} /></span>
                                <input
                                    id="reg-confirm"
                                    name="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    aria-label="Toggle confirm password"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="auth-error">{errors.confirmPassword}</span>
                            )}
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
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p className="auth-terms">
                            By creating an account you agree to our{' '}
                            <Link to="/terms" className="auth-terms-link">Terms</Link> and{' '}
                            <Link to="/privacy" className="auth-terms-link">Privacy Policy</Link>.
                        </p>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider"><span>or</span></div>

                    {/* Login link */}
                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-switch-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
