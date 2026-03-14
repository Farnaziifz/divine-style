import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatPriceToman } from '../utils/format';

export const StyleInspiration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find(p => p.id === id);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction, language } = useLanguage();
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  if (!product) return <div>Product not found</div>;

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

  // Filter related products (same category, excluding current)
  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#E8E0D9] animate-fade-in relative">
      
      {/* Header */}
      <div className="fixed top-0 w-full z-40 px-6 py-6 flex items-center justify-between mix-blend-difference text-[#E8E0D9]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <BackArrow size={24} /> <span className="uppercase tracking-widest text-sm">{t('style.back')}</span>
          </button>
          <h1 className="font-serif text-xl hidden md:block">{t('style.title')}</h1>
          <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Hero Video Section */}
      <section className="h-[80vh] w-full relative overflow-hidden">
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
                    onClick={() => addToCart(product)}
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
                            className="group relative w-[220px] flex flex-col items-center cursor-pointer pt-6"
                            onClick={() => navigate(`/${language}/product/${p.id}`)}
                        >
                            {/* Hanger Hook Visual */}
                            <div className="absolute top-[-10px] w-4 h-8 border-t-4 border-l-4 border-r-4 border-gray-400 rounded-t-full z-10"></div>
                            
                            {/* Product Card */}
                            <div className="relative w-full aspect-[2/3] bg-white shadow-xl rounded-lg overflow-hidden transform origin-top transition-all duration-500 ease-out group-hover:rotate-2 group-hover:scale-[1.02]">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4 text-center backdrop-blur-[1px]">
                                    <h4 className="font-serif text-xl mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{p.name}</h4>
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