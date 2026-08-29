import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function Index() {
  const [likesCount, setLikesCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-pink-100">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Heart className="w-8 h-8 text-white fill-current" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">LoveMatch App</h2>
        <p className="text-gray-500 text-sm mb-6">Welcome! Your dating app dashboard is ready.</p>
        
        <div className="bg-pink-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-pink-600">💖 Total Likes: {likesCount}</p>
        </div>

        <button 
          onClick={() => setLikesCount(likesCount + 1)}
          className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-all active:scale-95"
        >
          Give a Like!
        </button>
      </div>
    </div>
  );
}