import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { fetchProductById, fetchProductList } from '../services/productApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { formatPriceToman } from '../utils/format';
import { hasMultipleColors } from '../utils/variant';

export const StyleInspiration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction, language } = useLanguage();
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('Missing product id');
      return;
    }
    let cancelled = false;
    setError(null);
    setProduct(null);
    setIsLoading(true);
    fetchProductById(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        if (p.categoryId) {
          const list = await fetchProductList({ categoryId: p.categoryId, limit: 6 }).catch(() => []);
          if (!cancelled) setRelatedProducts(list.filter((r) => r.id !== p.id).slice(0, 5));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load product');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zafting-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-zafting-text" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-zafting-bg flex flex-col items-center justify-center p-8">
        <p className="text-zafting-text/80 text-lg mb-4">{error || t('product.not_found')}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-zafting-text text-zafting-bg px-6 py-3 rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-transform"
        >
          <BackArrow size={18} />
          {t('common.back')}
        </button>
      </div>
    );
  }

  // Mock Styling Looks (In a real app, this would come from the product object)
  const looks = [
    {
        title: 'Casual Chic',
        description: 'Perfect for a Sunday brunch or a walk in the park.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', // Generic styling img
        items: ['Silk Scarf', 'Vintage Bag']
    },
    {
        title: 'Evening Elegance',
        description: 'Turn heads at your next dinner party with this combination.',
        image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600&auto=format&fit=crop',
        items: ['Pearl Necklace', 'Heels']
    },
    {
        title: 'Office Ready',
        description: 'Professional yet full of character.',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
        items: ['Blazer', 'Leather Boots']
    }
  ];

  return (
    <div className="min-h-screen bg-zafting-bg animate-fade-in relative">

      {/* Hero Video Section */}
      <section className="h-[80vh] w-full relative overflow-hidden">
         {/* Back button + title: sits within the hero (not fixed) so it never
             stacks with MainLayout's global fixed Navbar in the same corner. */}
         <div className="absolute top-24 inset-x-6 z-20 flex items-center justify-between">
             <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-zafting-text transition-colors"
             >
                 <BackArrow size={20} /> <span className="uppercase tracking-widest text-sm">{t('style.back')}</span>
             </button>
             <h1 className="font-serif text-xl hidden md:block px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white">
               {t('style.title')}
             </h1>
         </div>

         <video
            src={product.video || 'https://videos.pexels.com/video-files/3205803/3205803-hd_1080_1920_25fps.mp4'} 
            className="w-full h-full object-cover filter brightness-75"
            autoPlay 
            muted 
            loop 
            playsInline
         />
         <div className="absolute bottom-0 start-0 w-full p-8 md:p-16 bg-gradient-to-t from-black/80 to-transparent text-white">
             <span className="inline-block px-3 py-1 border border-white/50 rounded-full text-xs uppercase tracking-widest mb-4 backdrop-blur-md">
                 {t('style.video')}
             </span>
             <h2 className="font-serif text-5xl md:text-7xl mb-4">{product.name}</h2>
             <p className="max-w-md text-lg opacity-80">{product.description}</p>
         </div>
      </section>

      {/* Looks Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
          <h3 className="font-serif text-4xl text-zafting-text mb-12 text-center">{t('style.looks')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {looks.map((look, idx) => (
                  <div key={idx} className="group">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6">
                          <img 
                            src={look.image} 
                            alt={look.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <h4 className="font-serif text-2xl mb-2 text-zafting-text">{look.title}</h4>
                      <p className="text-sm opacity-70 mb-4">{look.description}</p>
                      
                      {/* Suggested pairing chips */}
                      <div className="flex flex-wrap gap-2">
                          {look.items.map(item => (
                              <span key={item} className="px-3 py-1 bg-white/50 border border-zafting-text/10 rounded-full text-xs text-zafting-text">
                                  + {item}
                              </span>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Interactive Mix & Match CTA */}
      <section className="px-6 pb-20">
          <div className="bg-[#2A2A2A] rounded-[3rem] p-12 md:p-20 text-[#E8E0D9] text-center max-w-5xl mx-auto relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="font-serif text-4xl md:text-6xl mb-8">Make it Yours</h3>
                  <button
                    onClick={() => {
                      if (hasMultipleColors(product)) {
                        navigate(`/${language}/product/${product.id}`);
                        return;
                      }
                      addToCart(product);
                    }}
                    className="bg-[#E8E0D9] text-zafting-text px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:scale-105 transition-transform font-bold"
                  >
                      {t('shop.btn.buy')} - {formatPriceToman(product.price)}
                  </button>
              </div>
              
              {/* Decorative Circles */}
              <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
          </div>
      </section>

      {/* Related Products Rack (Hanging) */}
      {relatedProducts.length > 0 && (
        <section className="px-6 pb-24 relative overflow-hidden">
             <div className="flex flex-col items-center mb-12">
                 <span className="text-xs uppercase tracking-widest opacity-60 mb-2">{t('style.related_sub')}</span>
                 <h3 className="font-serif text-3xl md:text-5xl text-zafting-text text-center">{t('style.related')}</h3>
             </div>

             {/* Rail Visual */}
             <div className="absolute top-[160px] left-0 w-full h-3 bg-gradient-to-b from-gray-400 to-gray-600 shadow-md z-0 opacity-50"></div>

             <div className="overflow-x-auto pb-12 pt-8 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                <div className="flex justify-center gap-8 min-w-max">
                    {relatedProducts.map((p) => (
                        <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            className="group relative w-[220px] flex flex-col items-center cursor-pointer pt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-zafting-text rounded-lg"
                            onClick={() => navigate(`/${language}/product/${p.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(`/${language}/product/${p.id}`);
                              }
                            }}
                        >
                            {/* Hanger Hook Visual */}
                            <div className="absolute top-[-10px] w-4 h-8 border-t-4 border-l-4 border-r-4 border-gray-400 rounded-t-full z-10"></div>
                            
                            {/* Product Card */}
                            <div className="relative w-full aspect-[2/3] bg-white shadow-xl rounded-lg overflow-hidden transform origin-top transition-all duration-500 ease-out group-hover:rotate-2 group-hover:scale-[1.02]">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4 text-center backdrop-blur-[1px]">
                                    <h4 className="font-serif text-xl mb-1 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">{p.name}</h4>
                                    <p className="text-sm opacity-80 mb-3">{formatPriceToman(p.price)}</p>
                                    <button className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform">
                                        <ShoppingBag size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>
      )}

    </div>
  );
};