import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getProducts } from '../../services/product.service';
import { deleteProduct } from '../../services/admin.service';
import { imageUrl } from '../../utils/productAdapter';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            setProducts(response.data.products || response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch products", err);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(fetchProducts, 0);
        return () => window.clearTimeout(timer);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                fetchProducts(); // Refresh list
            } catch (err) {
                console.error("Failed to delete product", err);
                alert("Error deleting product");
            }
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-400">Loading products...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-10">{error}</div>;
    }

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Products</h1>
                    <p className="text-gray-400 mt-2">Manage your jewellery inventory.</p>
                </div>
                <Link to="/admin/products/new" className="admin-btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Metal</th>
                                <th>Weight (g)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id || product._id}>
                                        <td>
                                            <div className="w-12 h-12 bg-black/40 rounded overflow-hidden">
                                                <img 
                                                    src={imageUrl(product.images?.[0]) || 'https://via.placeholder.com/50'} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="font-medium text-white">{product.name}</td>
                                        <td className="capitalize">{product.category}</td>
                                        <td>{product.metal_type}</td>
                                        <td>{product.net_weight}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Link to={`/admin/products/${product.id || product._id}/edit`} className="text-blue-400 hover:text-blue-300">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => handleDelete(product.id || product._id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
