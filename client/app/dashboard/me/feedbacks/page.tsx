'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiStarFill, 
  RiStarLine, 
  RiSendPlaneLine, 
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

export default function FeedbacksPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      setTimeout(() => {
        // Mock successful submission
        setSuccess(true);
        setLoading(false);
        
        // Reset form after success
        setTimeout(() => {
          setRating(0);
          setFeedback('');
          setSuccess(false);
        }, 3000);
      }, 1500);
      
      // Uncomment when API endpoint is available
      /*
      const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          feedback
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setSuccess(false);
      }, 3000);
      */
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Share Your Feedback</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md"
      >
        <div className="p-6 border-b border-gray-200">
          <p className="text-gray-700">
            We value your opinion! Please share your experience with our equipment rental service.
            Your feedback helps us improve and provide better service to all our customers.
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <RiCheckboxCircleLine className="text-green-500 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
              <p className="text-gray-600">
                We appreciate you taking the time to share your experience with us.
              </p>
            </motion.div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <RiErrorWarningLine className="text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate your experience?</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={() => handleRatingHover(0)}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                  >
                    {(hoverRating || rating) >= star ? (
                      <RiStarFill className="text-yellow-400" />
                    ) : (
                      <RiStarLine className="text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-colors"
                placeholder="Share your experience with our rental service..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-[#1b4965] text-white rounded-lg text-base font-medium hover:bg-[#0d3b59] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RiLoader4Line className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RiSendPlaneLine />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
