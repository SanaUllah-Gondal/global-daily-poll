'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Random Poll Generator Data
const pollTopics = [
  {
    text: "Should artificial intelligence be regulated by strict international laws?",
    options: ["Yes, strictly", "Yes, with basic limits", "No, keep it open"]
  },
  {
    text: "Will remote work completely replace traditional office spaces by 2030?",
    options: ["Definitely Yes", "Partially (Hybrid)", "No, offices will stay"]
  },
  {
    text: "Should social media accounts require government ID verification to stop bots?",
    options: ["Yes, mandatory", "No, preserve anonymity", "Only for verified badges"]
  },
  {
    text: "Is nuclear energy the most effective solution to combat global climate change?",
    options: ["Yes, essential", "Maybe as secondary", "No, focus on solar/wind"]
  },
  {
    text: "Should four-day workweeks become the global standard for all companies?",
    options: ["Yes, full salary", "Yes, with adjusted pay", "No, five days is fine"]
  },
  {
    text: "Will cryptocurrencies eventually replace paper currencies worldwide?",
    options: ["Yes, inevitable", "They will coexist", "No, fiat currency is safer"]
  },
  {
    text: "Should autonomous driverless vehicles be allowed on public highways without human supervision?",
    options: ["Yes, fully safe", "Only in special lanes", "No, too risky"]
  },
  {
    text: "Is space exploration worth the billions spent while earth faces major challenges?",
    options: ["Yes, vital for humanity", "Reduce budget", "No, fix earth first"]
  },
  {
    text: "Should universities replace traditional degrees with skill-based AI certificates?",
    options: ["Yes, skills matter more", "Hybrid model is best", "No, degrees are essential"]
  },
  {
    text: "Will human lifespan regularly exceed 120 years due to biotech advances in this century?",
    options: ["Yes, highly likely", "Only for the rich", "Unlikely"]
  }
];

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [pollCount, setPollCount] = useState(1);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    generateNewPoll();
    if (!localStorage.getItem('voter_id')) {
      localStorage.setItem('voter_id', uuidv4());
    }
  }, []);

  // Endless Dynamic Poll Generator
  const generateNewPoll = () => {
    setLoading(true);
    setHasVoted(false);
    setCommentSubmitted(false);
    setCommentText('');

    // Pick a random poll template or create a dynamic combination
    const randomIndex = Math.floor(Math.random() * pollTopics.length);
    const selectedTopic = pollTopics[randomIndex];
    
    // Create unique dynamic Poll ID
    const uniquePollId = `poll-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    setQuestion({
      id: uniquePollId,
      text: selectedTopic.text,
      options: selectedTopic.options
    });

    setLoading(false);
  };

  const handleNextPoll = () => {
    setPollCount((prev) => prev + 1);
    generateNewPoll();
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

  if (loading || !question) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Generating dynamic poll...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mb-6">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Live Poll #{pollCount}
          </span>
          <button
            onClick={handleNextPoll}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
          >
            <span>🔄 Next Poll</span>
          </button>
        </div>

        {/* Question Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center leading-snug">
          {question.text}
        </h1>

        {/* Voting Options */}
        {!hasVoted ? (
          <div className="flex flex-col gap-3">
            {question.options.map((option: string, index: number) => (
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
            <p className="text-slate-500 text-xs mt-1">Click "Next Poll" above to keep voting.</p>
          </div>
        )}

        {/* Comment Section */}
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
              ✅ Comment submitted to the admin portal!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}