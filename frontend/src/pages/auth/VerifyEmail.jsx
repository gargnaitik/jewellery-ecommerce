import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../../services/auth.service';
import useAuthStore from '../../store/auth.store';
import './Auth.css';

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const { user, setUser } = useAuthStore();

    const [status, setStatus] = useState(token ? 'loading' : 'error');
    const [message, setMessage] = useState(token ? '' : 'This verification link is missing its token.');

    // the token is single use — guard against React StrictMode's double effect
    const requested = useRef(false);

    useEffect(() => {
        if (!token || requested.current) return;
        requested.current = true;

        verifyEmail(token)
            .then(({ data }) => {
                setStatus('success');
                setMessage(data.message || 'Email verified successfully');
                if (user && data.data?.id === user.id) setUser({ ...user, is_verified: true });
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
            });
    }, [token, user, setUser]);

    return (
        <div className="auth-page">
            <div className="auth-form-panel" style={{ margin: '0 auto' }}>
                <div className="auth-form-wrap" style={{ textAlign: 'center' }}>
                    {status === 'loading' && (
                        <>
                            <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 16px', color: '#C9A55A' }} />
                            <h1 className="auth-form-title">Verifying your email…</h1>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#4ade80' }} />
                            <h1 className="auth-form-title">Email verified</h1>
                            <p className="auth-form-sub">{message}</p>
                            <Link to="/products" className="auth-submit" style={{ marginTop: 24, textDecoration: 'none' }}>
                                Start shopping
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle size={48} style={{ margin: '0 auto 16px', color: '#f87171' }} />
                            <h1 className="auth-form-title">Verification failed</h1>
                            <p className="auth-form-sub">{message}</p>
                            <p className="auth-switch" style={{ marginTop: 24 }}>
                                You can request a new link from your{' '}
                                <Link to="/profile" className="auth-switch-link">profile</Link>.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
