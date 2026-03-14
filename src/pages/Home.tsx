import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/features/Hero';
import { ProductGrid } from '../components/features/ProductGrid';
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [featured, intro, all] = await Promise.all([
          fetchProductList({ isFeatured: true, limit: 10 }),
          fetchProductList({ showInIntro: true, limit: 10 }),
          fetchProductList({ limit: 12 }),
        ]);
        if (!cancelled) {
          setFeaturedProducts(featured);
          setIntroProducts(intro);
          setAllProducts(all);
        }
      } catch {
        if (!cancelled) {
          setFeaturedProducts([]);
          setIntroProducts([]);
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const heroProducts =
    introProducts.length > 0
      ? introProducts
      : featuredProducts.length > 0
        ? featuredProducts
        : allProducts;
  const heroFirst = heroProducts[0] ?? null;
  const heroIds = new Set(heroProducts.map((p) => p.id));
  const gridProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : allProducts.filter((p) => !heroIds.has(p.id));

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
      {heroProducts.length > 0 && (
        <Hero products={heroProducts} onProductClick={handleProductClick} />
      )}
      {gridProducts.length > 0 && (
        <ProductGrid
          products={gridProducts}
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
        />
      )}
      {heroFirst && (
        <ReviewsSection initialReviews={heroFirst.reviews || []} />
      )}
    </div>
  );
};
