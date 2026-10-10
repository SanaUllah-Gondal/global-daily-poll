'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Poll Questions List for Dynamic Switching
  const dummyQuestions = [
    {
      id: 'q1',
      text: 'Should artificial intelligence be regulated by international laws?',
      options: ['Yes, strictly', 'Yes, moderately', 'No, keep it open'],
    },
    {
      id: 'q2',
      text: 'Will remote work replace traditional office spaces completely by 2030?',
      options: ['Definitely Yes', 'Partially', 'No, offices will remain'],
    },
    {
      id: 'q3',
      text: 'Should social media usage require government identification verification?',
      options: ['Yes, to stop trolls/bots', 'No, preserve privacy', 'Only for specific features'],
    },
    {
      id: 'q4',
      text: 'Is renewable energy currently reliable enough to fully replace fossil fuels?',
      options: ['Yes, absolutely', 'In progress', 'Not yet'],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPoll(0);
    if (!localStorage.getItem('voter_id')) {
      localStorage.setItem('voter_id', uuidv4());
    }
  }, []);

  const loadPoll = (index: number) => {
    setLoading(true);
    setHasVoted(false);
    setCommentSubmitted(false);
    setCommentText('');
    
    // Set question from dynamic array
    setQuestion(dummyQuestions[index]);
    setLoading(false);
  };

  const handleNextPoll = () => {
    const nextIdx = (currentIndex + 1) % dummyQuestions.length;
    setCurrentIndex(nextIdx);
    loadPoll(nextIdx);
  };

  const handleVote = async (optionIndex: number) => {
    const voterId = localStorage.getItem('voter_id');
    setHasVoted(true);

    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question?.id, optionIndex, voterId }),
    }).catch(() => {});
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const voterId = localStorage.getItem('voter_id');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question?.id || 'general',
          voterId,
          commentText,
        }),
      });

      if (res.ok) {
        setCommentSubmitted(true);
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Loading next poll...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Poll #{currentIndex + 1}
          </span>
          <button
            onClick={handleNextPoll}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
          >
            🔄 Next Poll (Naya Poll)
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
          {question?.text}
        </h1>

        {!hasVoted ? (
          <div className="flex flex-col gap-3">
            {question?.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleVote(index)}
                className="w-full py-4 px-6 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-medium rounded-xl border border-slate-200 transition duration-200 text-left flex justify-between items-center group"
              >
                <span>{option}</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-green-50 border border-green-200 rounded-xl mb-4">
            <div className="text-3xl mb-1">🎉</div>
            <h2 className="text-xl font-bold text-green-700">Vote Registered!</h2>
          </div>
        )}

        {/* Comment Box Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Leave your thought on this poll:</h3>
          {!commentSubmitted ? (
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your opinion..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-slate-900 hover:bg-black text-white text-sm font-medium py-2 px-4 rounded-xl transition"
              >
                {submittingComment ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-xl text-center">
              ✅ Thank you! Your comment has been submitted to the admin.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}