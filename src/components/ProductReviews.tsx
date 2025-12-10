import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StarRating from '@/components/ui/star-rating';
import { 
  MessageSquare, 
  ThumbsUp, 
  Flag, 
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_email: string;
  verified_purchase: boolean;
  helpful_count: number;
}

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  totalReviews?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  averageRating = 0,
  totalReviews = 0,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from database
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Note: This would require a reviews table in your database
      // For now, we'll just set empty reviews since the table doesn't exist yet
      setReviews([]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => 
    selectedRating === 'all' || review.rating === parseInt(selectedRating)
  ).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      default:
        return 0;
    }
  });

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Note: This would require a reviews table in your database
      // For now, we'll just show a message since the table doesn't exist yet
      toast({
        title: 'Feature Coming Soon',
        description: 'Product reviews will be available once the reviews database table is created.',
      });
      
      setIsWritingReview(false);
      setNewRating(0);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  // Check if user has already reviewed
  const userHasReviewed = user && reviews.some(r => r.user_email === user.email);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Customer Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} readonly size="lg" className="justify-center mb-2" />
                <p className="text-gray-600">{totalReviews} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Write Review */}
      {user && !userHasReviewed && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isWritingReview ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <StarRating
                    rating={newRating}
                    onRatingChange={setNewRating}
                    size="lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSubmitReview}>
                    Submit Review
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsWritingReview(false);
                      setNewRating(0);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsWritingReview(true)}>
                Write a Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
              <div className="flex space-x-2">
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {getUserInitials(review.user_email)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <StarRating rating={review.rating} readonly size="sm" />
            {review.verified_purchase && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {review.user_email.split('@')[0]} • {formatDate(review.created_at)}
          </p>
          {review.comment && (
            <p className="text-gray-900 mb-3">{review.comment}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <ThumbsUp className="h-4 w-4" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <Flag className="h-4 w-4" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews; 