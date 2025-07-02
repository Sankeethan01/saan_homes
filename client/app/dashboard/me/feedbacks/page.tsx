'use client';

export default function FeedbacksPage() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Feedback</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    className="text-2xl text-yellow-400 hover:text-yellow-500"
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Share your experience with us..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#1b4965] text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                    >
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}
