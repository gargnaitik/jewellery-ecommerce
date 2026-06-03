import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, CheckCircle, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/auth.service';
import './auth/Auth.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const otpRefs = useRef([]);

    // Auto-focus first OTP input on mount
    useEffect(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
    }, []);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // take last char
        setOtp(newOtp);
        setError('');

        // auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    const validate = () => {
        if (!email.trim()) return 'Email is required';
        const otpString = otp.join('');
        if (otpString.length !== 6) return 'Enter the 6-digit OTP';
        if (!newPassword) return 'New password is required';
        if (newPassword.length < 6) return 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword) return 'Passwords do not match';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }

        setLoading(true);
        setError('');
        try {
            await resetPassword({
                email: email.toLowerCase().trim(),
                otp: otp.join(''),
                newPassword,
            });
            toast.success('Password reset successfully!');
            setSuccess(true);
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
                            Secure<br />
                            <em>password reset</em>
                        </h2>
                        <p className="auth-panel__text">
                            Enter the OTP sent to your email and choose a new password for your account.
                        </p>
                        <div className="auth-panel__features">
                            {['6-digit OTP Verification', 'Secure Password Reset', '256-bit Encryption', '24/7 Support'].map((f) => (
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
                            {success ? 'Password Reset!' : 'Reset your password'}
                        </h1>
                        <p className="auth-form-sub">
                            {success
                                ? 'Your password has been changed successfully.'
                                : 'Enter the OTP from your email and set a new password'
                            }
                        </p>
                    </div>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                            <ShieldCheck
                                size={56}
                                style={{ color: '#4CAF50', margin: '0 auto 20px' }}
                            />
                            <p style={{ fontSize: 14, color: '#8a7d6a', lineHeight: 1.75, marginBottom: 32 }}>
                                You can now sign in with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="auth-submit"
                                style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                Go to Sign In <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && <div className="auth-alert auth-alert--error">{error}</div>}

                            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                                {/* Email (pre-filled if coming from forgot page) */}
                                {!emailFromState && (
                                    <div className="auth-field">
                                        <label className="auth-label" htmlFor="reset-email">Email Address</label>
                                        <div className="auth-input-wrap">
                                            <input
                                                id="reset-email"
                                                type="email"
                                                autoComplete="email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                                placeholder="you@example.com"
                                                className="auth-input"
                                                style={{ paddingLeft: 16 }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* OTP Input */}
                                <div className="auth-field">
                                    <label className="auth-label">Enter 6-digit OTP</label>
                                    <div style={{
                                        display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8,
                                    }}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => otpRefs.current[i] = el}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                onPaste={i === 0 ? handleOtpPaste : undefined}
                                                className="auth-input"
                                                style={{
                                                    width: 48,
                                                    height: 52,
                                                    textAlign: 'center',
                                                    fontSize: 22,
                                                    fontWeight: 700,
                                                    letterSpacing: 0,
                                                    padding: 0,
                                                    borderRadius: 10,
                                                    border: digit ? '2px solid #C9A55A' : '1.5px solid #e0dcd4',
                                                    background: digit ? '#faf6ef' : '#f8f7f4',
                                                    color: '#333',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="new-password">New Password</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Lock size={16} /></span>
                                        <input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                            placeholder="Minimum 6 characters"
                                            className="auth-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4,
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="confirm-password">Confirm Password</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Lock size={16} /></span>
                                        <input
                                            id="confirm-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Re-enter your password"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <span className="auth-spinner" />
                                        : <>Reset Password <ArrowRight size={16} /></>
                                    }
                                </button>
                            </form>

                            <div className="auth-divider"><span>or</span></div>

                            <p className="auth-switch">
                                <Link to="/forgot-password" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <ArrowLeft size={14} /> Resend OTP
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
