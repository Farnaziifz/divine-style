import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/features/Hero';
import { ProductGrid } from '../components/features/ProductGrid';
import { IntroSection } from '../components/features/IntroSection';
import { ReviewsSection } from '../components/features/ReviewsSection';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchProductList } from '../services/productApi';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [introProducts, setIntroProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [featured, intro] = await Promise.all([
          fetchProductList({ isFeatured: true, limit: 10 }),
          fetchProductList({ showInIntro: true, limit: 20 }),
        ]);
        if (!cancelled) {
          setFeaturedProducts(featured);
          setIntroProducts(intro);
        }
      } catch {
        if (!cancelled) {
          setFeaturedProducts([]);
          setIntroProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const featuredProduct = featuredProducts[0] ?? null;
  const otherFeaturedProducts = featuredProduct
    ? featuredProducts.slice(1)
    : featuredProducts;

  const handleProductClick = (product: Product) => {
    navigate(`/${language}/product/${product.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-zafting-text/30 border-t-zafting-text rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {featuredProduct && (
        <Hero featuredProduct={featuredProduct} onAddToCart={addToCart} />
      )}
      {introProducts.length > 0 && (
        <IntroSection
          products={introProducts}
          onProductClick={handleProductClick}
          onAddToCart={addToCart}
        />
      )}
      {otherFeaturedProducts.length > 0 && (
        <ProductGrid
          products={otherFeaturedProducts}
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
        />
      )}
      {featuredProduct && (
        <ReviewsSection initialReviews={featuredProduct.reviews || []} />
      )}
    </div>
  );
};
