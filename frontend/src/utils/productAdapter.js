const CATEGORY_LABELS = {
    ring: 'Rings',
    necklace: 'Necklaces',
    earring: 'Earrings',
    bracelet: 'Bracelets',
    bangle: 'Bangles',
    pendant: 'Pendants',
    chain: 'Chains',
    anklet: 'Anklets',
    mangalsutra: 'Mangalsutras',
};

const METAL_LABELS = {
    gold: 'Gold',
    silver: 'Silver',
    platinum: 'Platinum',
    diamond: 'Diamond',
};

export const categoryToApi = (category) => {
    if (!category || category === 'All') return undefined;
    const value = category.toLowerCase();
    const aliases = {
        rings: 'ring',
        necklaces: 'necklace',
        earrings: 'earring',
        bracelets: 'bracelet',
        bangles: 'bangle',
        pendants: 'pendant',
        chains: 'chain',
        anklets: 'anklet',
        mangalsutras: 'mangalsutra',
    };
    return aliases[value] || value;
};

export const metalToApi = (metal) => {
    if (!metal || metal === 'All') return undefined;
    const value = metal.toLowerCase();
    if (value.includes('gold')) return 'gold';
    return value;
};

export const sortToApi = (sort) => ({
    'price-asc': 'price_asc',
    'price-desc': 'price_desc',
    'weight-asc': 'weight_asc',
})[sort] || undefined;

export const imageUrl = (image) => {
    if (!image) return '';
    return typeof image === 'string' ? image : image.url || '';
};

export const normalizeProduct = (product = {}) => {
    const id = product._id || product.id;
    const karat = product.karat || product.purity;
    const metalType = product.metal_type || product.metal || '';
    const metalLabel = metalType === 'gold' && karat ? `${karat}K Gold` : METAL_LABELS[metalType] || metalType;
    const netWeight = Number(product.net_weight ?? product.weight ?? product.gold_weight ?? 0);
    const grossWeight = Number(product.gross_weight ?? product.weight ?? netWeight);
    const basePrice = Number(product.base_price ?? product.price ?? product.totalPrice ?? 0);

    return {
        ...product,
        _id: id,
        id,
        category: product.category,
        categoryLabel: CATEGORY_LABELS[product.category] || product.category || '',
        metal_type: metalType,
        metal: metalLabel,
        karat,
        net_weight: netWeight,
        gross_weight: grossWeight,
        weight: netWeight,
        making_charges: Number(product.making_charges ?? product.makingCharges ?? 0),
        base_price: basePrice,
        price: basePrice,
        images: product.images || [],
        primaryImage: imageUrl(product.images?.[0]),
        stock: Number(product.stock ?? 0),
    };
};

export const calculateDisplayPrice = (product, goldRate = 0) => {
    const item = normalizeProduct(product);
    if (item.base_price > 0) return item.base_price;

    const stoneValue = item.stones?.reduce((total, stone) => total + Number(stone.price || 0), 0) || 0;
    const goldValue = item.metal_type === 'gold' ? item.net_weight * goldRate : 0;
    const subtotal = goldValue + item.making_charges + stoneValue;
    return subtotal + subtotal * 0.03;
};
