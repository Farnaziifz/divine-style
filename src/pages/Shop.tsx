import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft, ArrowDownLeft, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { PRODUCTS } from '../constants';

export const Shop: React.FC = () => {
  const { t, direction } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  
  // Reuse existing products for imagery
  const heroImage = PRODUCTS[2].image; // Marianne (Gown)
  const bottomImage = PRODUCTS[0].image; // Clara

  // Collection Data
  const collections = [
    {
        id: 1,
        image: PRODUCTS[3].image, // Josephine (Blue top looks good for 'light')
        tag: t('collection.light.tag'),
        desc: t('collection.light.desc'),
        bgColor: 'bg-[#8CA2B0]', // Muted Blue/Grey from reference
        textColor: 'text-white'
    },
    {
        id: 2,
        image: PRODUCTS[2].image, // Marianne (Gown)
        tag: t('collection.evening.tag'),
        desc: t('collection.evening.desc'),
        bgColor: 'bg-[#6B5B54]', // Brownish
        textColor: 'text-[#E8E0D9]'
    },
    {
        id: 3,
        image: PRODUCTS[1].image, // Elise (Polka dot)
        tag: t('collection.casual.tag'),
        desc: t('collection.casual.desc'),
        bgColor: 'bg-[#2A2A2A]', // Dark
        textColor: 'text-[#E8E0D9]'
    }
  ];

  // Categories Data
  const categories = [
    { id: 'pants', label: t('shop.cat.pants'), img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop' },
    { id: 'lingerie', label: t('shop.cat.lingerie'), img: 'https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=600&auto=format&fit=crop' },
    { id: 'sleepwear', label: t('shop.cat.sleepwear'), img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop' },
    { id: 'tops', label: t('shop.cat.tops'), img: 'https://images.unsplash.com/photo-1551163943-3f6a2b03d289?q=80&w=600&auto=format&fit=crop' },
    { id: 'shoes', label: t('shop.cat.shoes'), img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop' },
    { id: 'accessories', label: t('shop.cat.accessories'), img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop' },
  ];

  // Create a longer list for scrolling demonstration
  const scrollList = [...collections, ...collections];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextCollection = () => {
    setActiveIndex((prev) => (prev + 1) % collections.length);
  };

  const getCardStyle = (index: number) => {
    // Calculate effective position in the circular queue relative to activeIndex
    // We want 3 visible states: 0 (Active), 1 (Back 1), 2 (Back 2)
    const len = collections.length;
    // (index - activeIndex + len) % len gives us the distance from active
    const position = (index - activeIndex + len) % len;

    // We only want to render specific positions effectively
    if (position === 0) {
        return {
            zIndex: 30,
            transform: 'scale(1) translateX(0) rotate(0deg)',
            opacity: 1
        };
    } else if (position === 1) {
        // Behind
        return {
            zIndex: 20,
            transform: `scale(0.95) translateX(${direction === 'rtl' ? '-20px' : '20px'}) rotate(-3deg)`,
            opacity: 0.8
        };
    } else {
        // Way behind or just moving to back
        return {
            zIndex: 10,
            transform: `scale(0.9) translateX(${direction === 'rtl' ? '-40px' : '40px'}) rotate(-6deg)`,
            opacity: 0.6
        };
    }
  };

  return (
    <div className="w-full bg-[#E8E0D9] min-h-screen pt-20">
      
      {/* 1. Header Section (Dark Theme) */}
      <section className="mx-4 md:mx-6 bg-[#2A2A2A] rounded-[3rem] text-[#E8E0D9] p-6 md:p-12 lg:p-16 min-h-[85vh] flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-between z-10">
          <div>
            <div className="inline-block px-4 py-1 border border-[#E8E0D9]/30 rounded-full text-xs uppercase tracking-widest mb-6">
              {t('shop.hero.tag')}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-8">
              {t('shop.hero.title')}
            </h1>
          </div>
          
          <div className="mt-12 lg:mt-0 max-w-sm">
             <div className="flex gap-2 mb-4">
                 <div className="w-10 h-10 rounded-full bg-[#E8E0D9]/10 border border-[#E8E0D9]/20 flex items-center justify-center">
                    <span className="text-xs">IG</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-[#E8E0D9]/10 border border-[#E8E0D9]/20 flex items-center justify-center">
                    <span className="text-xs">FB</span>
                 </div>
             </div>
             <p className="font-sans text-sm opacity-60 leading-relaxed border-t border-[#E8E0D9]/20 pt-4">
               {t('shop.hero.subtitle')}
             </p>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 mt-8 lg:mt-0 relative">
           <div className="absolute top-0 end-0 bg-[#E8E0D9] text-[#2A2A2A] rounded-full px-6 py-2 flex items-center gap-2 z-20 font-bold text-sm cursor-pointer hover:scale-105 transition-transform">
               {t('shop.btn.buy')} <ShoppingBag size={14} />
           </div>
           
           <div className="w-full h-[50vh] lg:h-full rounded-[2rem] overflow-hidden relative">
             <img src={heroImage} alt="Collection" className="w-full h-full object-cover opacity-90" />
             
             {/* Decorative Elements */}
             <div className="absolute bottom-6 start-6 flex gap-2">
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs">July</span>
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs">2024</span>
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs">Collection</span>
             </div>
           </div>
           
           {/* Abstract Circle/Arrow */}
           <div className="absolute bottom-10 -start-10 bg-white text-[#2A2A2A] w-20 h-20 rounded-full flex items-center justify-center z-20 hidden lg:flex">
                <ArrowDownLeft size={32} />
           </div>
        </div>
      </section>

      {/* 2. Interactive Collection Stack & Scroll List */}
      <section className="px-6 py-20 max-w-[1600px] mx-auto min-h-[80vh] flex flex-col items-center justify-center gap-16">
         
         {/* Stack */}
         <div className="w-full max-w-5xl relative aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.2/1]">
            {collections.map((item, index) => {
                const style = getCardStyle(index);
                return (
                    <div 
                        key={item.id}
                        className={`absolute inset-0 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-700 ease-out cursor-pointer ${item.bgColor}`}
                        style={style}
                        onClick={nextCollection}
                    >
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Image Part */}
                            <div className="md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
                                <img 
                                    src={item.image} 
                                    alt="Collection" 
                                    className="w-full h-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:hidden"></div>
                            </div>

                            {/* Content Part */}
                            <div className={`md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-between ${item.textColor} relative`}>
                                
                                <div className="self-end">
                                    <span className="border border-current px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                                        {item.tag}
                                    </span>
                                </div>

                                <div className="max-w-xs self-end text-end rtl:text-start rtl:self-start mt-4 md:mt-0">
                                    <p className="font-serif text-2xl md:text-3xl lg:text-4xl leading-snug">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="self-end">
                                    <button 
                                        className="w-14 h-14 bg-[#E8E0D9] text-[#2A2A2A] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                        aria-label="Next Collection"
                                    >
                                        <ArrowDownLeft size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
         </div>

         {/* Horizontal Scroll List */}
         <div className="w-full overflow-hidden">
             <div 
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-4 md:px-0 [&::-webkit-scrollbar]:hidden" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             >
                 {scrollList.map((item, idx) => (
                     <div 
                         key={idx}
                         className={`min-w-[320px] md:min-w-[420px] h-[220px] rounded-[2rem] p-4 flex gap-4 shrink-0 snap-center cursor-pointer transition-all hover:scale-[1.02] ${item.bgColor} ${item.textColor}`}
                     >
                         {/* Stacked Image Container */}
                         <div className="w-[45%] h-full relative group">
                             {/* Decorative Stack Layers */}
                             <div className={`absolute inset-0 rounded-[1.5rem] transform translate-x-1.5 translate-y-1 rotate-6 opacity-30 transition-transform duration-500 group-hover:rotate-12 group-hover:translate-x-3 ${item.textColor === 'text-white' ? 'bg-white' : 'bg-[#E8E0D9]'}`}></div>
                             <div className={`absolute inset-0 rounded-[1.5rem] transform -translate-x-1 translate-y-0.5 -rotate-3 opacity-60 transition-transform duration-500 group-hover:-rotate-6 group-hover:-translate-x-2 ${item.textColor === 'text-white' ? 'bg-white' : 'bg-[#E8E0D9]'}`}></div>
                             
                             <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-lg z-10">
                                 <img src={item.image} alt="" className="w-full h-full object-cover" />
                             </div>
                         </div>

                         <div className="flex-1 flex flex-col justify-between py-2">
                             <span className="text-[10px] border border-current px-3 py-1 rounded-full self-start uppercase tracking-wider">
                                 {item.tag}
                             </span>
                             <p className="font-serif text-lg leading-tight line-clamp-3 opacity-90">
                                 {item.desc}
                             </p>
                             <div className="w-10 h-10 rounded-2xl bg-[#E8E0D9] text-[#2A2A2A] flex items-center justify-center self-end shadow-md">
                                 <ArrowDownLeft size={16} />
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

      </section>

      {/* 3. Bottom Section */}
      <section className="px-6 pb-20 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-end">
              
              <div className="lg:w-1/3">
                 <div className="inline-block px-4 py-1 border border-zafting-text/30 rounded-full text-xs uppercase tracking-widest mb-6">
                    #collection
                 </div>
                 <h2 className="font-serif text-4xl md:text-5xl text-zafting-text leading-[0.9]">
                    {t('shop.bottom.title')} <br/>
                    <span className="text-zafting-text/50">{t('shop.bottom.subtitle')}</span>
                 </h2>
                 <button className="w-12 h-12 rounded-full bg-[#2A2A2A] text-white flex items-center justify-center mt-8 hover:scale-110 transition-transform">
                     <ArrowDownLeft size={20} />
                 </button>
              </div>

              <div className="lg:w-2/3 relative h-[400px] rounded-[2rem] overflow-hidden">
                 <img src={bottomImage} alt="Bottom Feature" className="w-full h-full object-cover object-top" />
                 
                 <div className="absolute bottom-8 end-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl max-w-xs border border-white">
                    <h4 className="font-serif text-xl mb-1">Office Suit | EXCLUSIVE</h4>
                    <p className="text-xs opacity-60">Get 10% discount on your first purchase for registration.</p>
                 </div>
              </div>
          </div>
      </section>

      {/* 4. Category Grid Section (NEW) */}
      <section className="px-6 pb-32 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-serif text-4xl md:text-6xl text-zafting-text">
                {t('shop.cat.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
             {categories.map((cat, idx) => (
                 <div 
                    key={cat.id} 
                    className={`group relative h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden cursor-pointer ${idx % 2 === 0 ? 'mt-0' : 'md:mt-8'}`}
                    onClick={() => navigate(`/category/${cat.id}`)}
                 >
                     {/* Image with zoom effect */}
                     <img 
                        src={cat.img} 
                        alt={cat.label} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500"></div>
                     
                     {/* Content */}
                     <div className="absolute bottom-0 start-0 w-full p-6 flex justify-between items-end">
                         <div className="bg-[#E8E0D9]/90 backdrop-blur-md px-6 py-3 rounded-full">
                            <h3 className="font-serif text-lg md:text-xl text-zafting-text">{cat.label}</h3>
                         </div>
                         <div className="w-12 h-12 bg-white text-zafting-text rounded-full flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                             <ArrowUpRight size={20} />
                         </div>
                     </div>
                 </div>
             ))}
          </div>
      </section>

    </div>
  );
};