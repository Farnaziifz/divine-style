import React from 'react';
import { Product } from '../../types';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceToman } from '../../utils/format';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  title?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onProductClick, title }) => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="font-serif text-4xl md:text-5xl text-zafting-text mb-12 text-center">
        {title || t('collection.title')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group cursor-pointer"
            onClick={() => onProductClick && onProductClick(product)}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[50px] mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                }}
                className="absolute bottom-4 end-4 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-zafting-text hover:text-[#E8E0D9]"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-serif text-xl text-zafting-text">{product.name}</h3>
                    <p className="text-xs text-zafting-text/60 uppercase tracking-widest mt-1">
                      {product.category}
                    </p>
                </div>
                <span className="font-medium text-zafting-text">{formatPriceToman(product.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};