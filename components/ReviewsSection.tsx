import React, { useState } from 'react';
import { Star, User, CheckCircle, PenLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Review } from '../types';

interface ReviewsSectionProps {
  initialReviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ initialReviews = [] }) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWriting, setIsWriting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      userName: 'Guest User', // In a real app, from auth
      date: new Date().toISOString().split('T')[0],
      rating: newRating,
      comment: newComment,
      role: 'Fashion Enthusiast'
    };

    setReviews([newReview, ...reviews]);
    setNewComment('');
    setIsWriting(false);
  };

  return (
    <div className="mt-16 mb-24">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-serif text-2xl md:text-3xl text-zafting-text">
          {t('reviews.title')} <span className="text-lg opacity-50 font-sans">({reviews.length})</span>
        </h3>
        
        <button 
          onClick={() => setIsWriting(!isWriting)}
          className="flex items-center gap-2 text-sm border-b border-zafting-text pb-1 hover:text-zafting-accent transition-colors"
        >
           <PenLine size={16} /> {t('reviews.write')}
        </button>
      </div>

      {/* Write Review Form */}
      {isWriting && (
        <form onSubmit={handleSubmit} className="bg-white/40 p-6 rounded-2xl mb-8 animate-fade-in border border-white">
           <div className="mb-4">
               <label className="block text-xs uppercase tracking-widest mb-2 font-bold opacity-60">{t('reviews.stars')}</label>
               <div className="flex gap-1 text-yellow-500 cursor-pointer">
                   {[1, 2, 3, 4, 5].map((star) => (
                       <Star 
                        key={star} 
                        size={24} 
                        fill={star <= newRating ? 'currentColor' : 'none'} 
                        onClick={() => setNewRating(star)}
                        className="hover:scale-110 transition-transform"
                       />
                   ))}
               </div>
           </div>
           
           <textarea
             value={newComment}
             onChange={(e) => setNewComment(e.target.value)}
             placeholder={t('reviews.placeholder')}
             className="w-full bg-white/50 border border-white rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-zafting-text mb-4 min-h-[100px]"
           />
           
           <div className="flex justify-end gap-3">
               <button 
                 type="button" 
                 onClick={() => setIsWriting(false)}
                 className="px-4 py-2 text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
               >
                   {t('reviews.cancel')}
               </button>
               <button 
                 type="submit"
                 disabled={!newComment.trim()}
                 className="bg-zafting-text text-[#E8E0D9] px-6 py-2 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
               >
                   {t('reviews.submit')}
               </button>
           </div>
        </form>
      )}

      {/* Reviews List - Card Grid */}
      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/60 hover:border-white transition-colors shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zafting-text/10 overflow-hidden flex items-center justify-center">
                      {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                      ) : (
                          <User size={18} className="opacity-50" />
                      )}
                  </div>
                  <div>
                      <h4 className="font-serif text-lg leading-none">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                          {review.role === 'Verified Buyer' && (
                              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle size={10} /> {t('reviews.role.verified')}
                              </span>
                          )}
                          <span className="text-xs opacity-40">{review.date}</span>
                      </div>
                  </div>
               </div>

               <div className="flex text-yellow-600 gap-0.5">
                   {[...Array(5)].map((_, i) => (
                       <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                   ))}
               </div>
            </div>

            <p className="text-zafting-text/80 leading-relaxed text-sm">
                "{review.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};