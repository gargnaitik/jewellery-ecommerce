import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductById } from '../../services/product.service';
import { createProduct, updateProduct } from '../../services/admin.service';

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        metal_type: 'gold',
        karat: 22,
        gross_weight: 0,
        net_weight: 0,
        making_charges: 0,
        category: 'ring',
        gender: 'women',
        stock: 0,
        images: [''] // store just one URL for simplicity in this MVP
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const res = await getProductById(id);
                    const p = res.data.product || res.data.data || res.data;
                    setFormData({
                        ...p,
                        images: p.images?.length > 0 ? [p.images[0].url || p.images[0]] : ['']
                    });
                } catch (err) {
                    console.error('Failed to fetch product', err);
                    setError('Failed to load product details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            images: [e.target.value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Format data for API (images is array of objects in backend)
            const payload = {
                ...formData,
                images: formData.images[0] ? [{ url: formData.images[0], alt: formData.name }] : []
            };

            if (isEditMode) {
                await updateProduct(id, payload);
                toast.success('Product updated successfully!');
            } else {
                await createProduct(payload);
                toast.success('Product created successfully!');
            }
            navigate('/admin/products');
        } catch (err) {
            console.error('Save failed', err);
            const msg = err.response?.data?.message || 'Failed to save product.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-400">Loading product data...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/products" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
                    <ArrowLeft size={20} /> Back to Products
                </Link>
            </div>

            <div className="admin-header">
                <div>
                    <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                    <p className="text-gray-400 mt-2">Fill in the details below.</p>
                </div>
            </div>

            {error && <div className="bg-red-500/20 text-red-500 p-4 rounded-lg mb-6 border border-red-500/50">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="admin-card">
                    <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">SKU</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none uppercase" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none">
                                <option value="ring">Ring</option>
                                <option value="necklace">Necklace</option>
                                <option value="earring">Earring</option>
                                <option value="bracelet">Bracelet</option>
                                <option value="bangle">Bangle</option>
                                <option value="pendant">Pendant</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none">
                                <option value="women">Women</option>
                                <option value="men">Men</option>
                                <option value="unisex">Unisex</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">Metal & Weight Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Metal Type</label>
                            <select name="metal_type" value={formData.metal_type} onChange={handleChange}
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none">
                                <option value="gold">Gold</option>
                                <option value="silver">Silver</option>
                                <option value="platinum">Platinum</option>
                                <option value="diamond">Diamond</option>
                            </select>
                        </div>
                        {formData.metal_type === 'gold' && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Karat</label>
                                <select name="karat" value={formData.karat} onChange={handleChange}
                                    className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none">
                                    <option value="14">14K</option>
                                    <option value="18">18K</option>
                                    <option value="22">22K</option>
                                    <option value="24">24K</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Gross Weight (g)</label>
                            <input type="number" step="0.01" name="gross_weight" value={formData.gross_weight} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Net Weight (g)</label>
                            <input type="number" step="0.01" name="net_weight" value={formData.net_weight} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Making Charges (₹)</label>
                            <input type="number" name="making_charges" value={formData.making_charges} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Stock Quantity</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
                                className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">Media</h2>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                        <input type="text" value={formData.images[0]} onChange={handleImageChange} placeholder="https://..."
                            className="w-full bg-[#191919] border border-white/20 rounded px-4 py-2 text-white focus:border-[#d4af37] outline-none mb-4" />
                        {formData.images[0] && (
                            <div className="w-32 h-32 rounded-lg border border-white/10 overflow-hidden bg-black/50">
                                <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="admin-btn-primary px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 disabled:opacity-50">
                        <Save size={20} /> {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
