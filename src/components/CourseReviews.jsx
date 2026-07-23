import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';

const CourseReviews = ({ courseId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId, user?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    
    // Fetch reviews with user info
    const { data: reviewsData } = await supabase
      .from('course_reviews')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData);
      
      // Check if current user has already reviewed
      if (user) {
        const existing = reviewsData.find(r => r.user_id === user.id);
        setUserReview(existing || null);
        if (existing) {
          setRating(existing.rating);
          setComment(existing.comment || '');
        }
      }
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    const reviewData = {
      course_id: courseId,
      user_id: user.id,
      rating,
      comment: comment.trim()
    };

    const { error } = await supabase
      .from('course_reviews')
      .upsert(reviewData, {
        onConflict: 'course_id,user_id'
      });

    if (!error) {
      await fetchReviews();
      setShowForm(false);
    }
    
    setIsSubmitting(false);
  };

  const handleHelpful = async (reviewId) => {
    if (!user) return;
    
    await supabase.rpc('increment_review_helpful', { review_id: reviewId });
    await fetchReviews();
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-display text-5xl font-bold text-white">{averageRating}</div>
            <div className="flex items-center gap-1 justify-center md:justify-start mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-1">{reviews.length} reviews</p>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          
          <div className="md:text-right">
            {!userReview && user && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300"
              >
                Write a Review
              </button>
            )}
            {!user && (
              <p className="text-slate-500 text-sm">
                Sign in to leave a review
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <h3 className="font-display text-lg font-semibold text-white mb-4">
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">Review (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500/50 focus:outline-none resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No reviews yet</p>
            {user && (
              <p className="text-slate-600 text-sm mt-2">
                Be the first to review this course
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  {review.profiles?.avatar_url ? (
                    <img
                      src={review.profiles.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-white">
                      {review.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-slate-600 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.user_id === user?.id && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {review.comment && (
                    <p className="text-slate-300 mt-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      disabled={!user}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful_count || 0})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
