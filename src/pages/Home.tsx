import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/features/Hero';
import { ProductGrid } from '../components/features/ProductGrid';
import { ReviewsSection } from '../components/features/ReviewsSection';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const featuredProduct = PRODUCTS.find(p => p.isFeatured) || PRODUCTS[0];
  const otherProducts = PRODUCTS.filter(p => p.id !== featuredProduct.id);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="animate-fade-in">
      <Hero featuredProduct={featuredProduct} onAddToCart={addToCart} />
      <ProductGrid 
        products={otherProducts} 
        onAddToCart={addToCart}
        onProductClick={handleProductClick}
      />
      <ReviewsSection initialReviews={featuredProduct?.reviews || []} />
    </div>
  );
};
