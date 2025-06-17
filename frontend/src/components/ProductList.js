import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        getProducts().then(setProducts).catch(() => setProducts([]));
    }, []);
    // Defensive: if products is undefined, treat as empty array
    const safeProducts = Array.isArray(products) ? products : [];
    return (
        <div>
            {safeProducts.length === 0 ? <p>No products found.</p> :
                safeProducts.map(p => (
                    <div key={p._id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <p>Price: ${p.price}</p>
                        {p.imageUrl && <img src={`http://localhost:4000${p.imageUrl}`} alt={p.name} width={100} />}
                    </div>
                ))
            }
        </div>
    );
};

export default ProductList; 