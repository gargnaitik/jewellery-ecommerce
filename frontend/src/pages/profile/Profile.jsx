import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMe, logout, resendVerification } from '../../services/auth.service';
import '../orders/orders.css'; // Reusing premium aesthetic css

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMe();
                setUser(response.data.user || response.data.data || response.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
        } catch (err) {
            console.error("Logout failed", err);
            toast.error('Logout failed');
        } finally {
            localStorage.removeItem('token');
            navigate('/');
            // Force a reload to clear any residual state in App
            window.location.reload();
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const { data } = await resendVerification();
            toast.success(data.message || 'Verification email sent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not send verification email');
        } finally {
            setResending(false);
        }
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="loader-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>My Account</h1>
                <p>Manage your profile and settings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {/* Sidebar Navigation (Visual only for now) */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center border border-[#d4af37]/50 text-[#d4af37]">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-sm text-gray-400">{user.role === 'admin' ? 'Administrator' : 'Premium Member'}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link to="/profile" className="flex items-center gap-3 w-full p-3 rounded-lg bg-white/10 text-white font-medium">
                                <User size={18} /> Profile Details
                            </Link>
                            <Link to="/orders" className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                                <Package size={18} /> My Orders
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left mt-8">
                                <LogOut size={18} /> Logout
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><User size={20} className="text-[#d4af37]" /> Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <div className="p-3 bg-black/40 border border-white/10 rounded-lg text-white">
                                    {user.name || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                <div className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-center gap-2 text-white">
                                    <Mail size={16} className="text-gray-500" />
                                    {user.email || 'N/A'}
                                </div>
                                {user.email && (user.is_verified ? (
                                    <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                        <ShieldCheck size={14} /> Verified
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-amber-400 flex items-center gap-2">
                                        <ShieldAlert size={14} /> Not verified
                                        <button
                                            onClick={handleResend}
                                            disabled={resending}
                                            className="text-[#d4af37] hover:underline disabled:opacity-50"
                                        >
                                            {resending ? 'Sending…' : 'Resend link'}
                                        </button>
                                    </p>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                <div className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-center gap-2 text-white">
                                    <Phone size={16} className="text-gray-500" />
                                    {user.phone || 'Not provided'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin size={20} className="text-[#d4af37]" /> Saved Addresses</h3>
                            <button className="text-sm text-[#d4af37] hover:underline">Add New</button>
                        </div>
                        <div className="p-4 border border-white/10 rounded-lg bg-black/20">
                            <p className="text-gray-400 text-sm italic">You currently don't have any saved addresses. Addresses will be saved automatically when you place an order.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
