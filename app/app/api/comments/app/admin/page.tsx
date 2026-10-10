'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Unlimited Dynamic Question Generator Engine
const topics = [
  { category: "Technology", subject: "Artificial Intelligence", action: "be granted legal rights or personhood" },
  { category: "Workforce", subject: "Remote Work", action: "be recognized as a fundamental employee right" },
  { category: "Cybersecurity", subject: "Social Media Platforms", action: "require mandatory real-name government ID verification" },
  { category: "Energy", subject: "Nuclear Energy", action: "be rapidly expanded to fully replace fossil fuels" },
  { category: "Economics", subject: "4-Day Workweeks", action: "become the legal standard for all corporate businesses" },
  { category: "Finance", subject: "Cryptocurrencies", action: "completely replace traditional physical paper money" },
  { category: "Automotive", subject: "Driverless Autonomous Cars", action: "be allowed on highways without human backup drivers" },
  { category: "Space", subject: "Mars Colonization Projects", action: "receive public funding ahead of Earth environmental programs" },
  { category: "Education", subject: "Skill-Based AI Certificates", action: "replace traditional 4-year university college degrees" },
  { category: "Biotech", subject: "Human Gene Editing", action: "be permitted for genetic health enhancements" },
  { category: "Society", subject: "Universal Basic Income (UBI)", action: "be guaranteed to all citizens regardless of income" },
  { category: "Privacy", subject: "Cashless Society", action: "eliminate physical banknotes completely" },
  { category: "Media", subject: "AI-Generated Media & Deepfakes", action: "carry legally enforced digital watermarks" },
  { category: "Urban Planning", subject: "Smart Facial Recognition", action: "be installed in all major public transport systems" }
];

const questionPrefixes = [
  "In the near future, should",
  "Do you agree that",
  "Is it time that global laws mandate",
  "Should world governments ensure that",
  "Would humanity benefit if"
];

const optionSets = [
  ["Yes, strongly agree", "Neutral / Dependent", "No, strongly disagree"],
  ["Definitely Yes", "Only with strict limits", "No, absolutely not"],
  ["It is necessary", "Too risky right now", "It should be banned"],
  ["High priority", "Medium priority", "Low / No priority"]
];

function generateDynamicPoll() {
  const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
  const selectedPrefix = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)];
  const selectedOptions = optionSets[Math.floor(Math.random() * optionSets.length)];
  
  const pollId = `poll-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const fullText = `${selectedPrefix} ${selectedTopic.subject.toLowerCase()} ${selectedTopic.action}?`;

  return {
    id: pollId,
    category: selectedTopic.category,
    text: fullText,
    options: selectedOptions
  };
}

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
    loadNewPoll();
    if (!localStorage.getItem('voter_id')) {
      localStorage.setItem('voter_id', uuidv4());
    }
  }, []);

  const loadNewPoll = () => {
    setLoading(true);
    setHasVoted(false);
    setCommentSubmitted(false);
    setCommentText('');

    const newPoll = generateDynamicPoll();
    setQuestion(newPoll);
    setLoading(false);
  };

  const handleNextPoll = () => {
    setPollCount((prev) => prev + 1);
    loadNewPoll();
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
        <div className="text-slate-500 font-medium">Generating new dynamic poll...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mb-6">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {question.category} • Poll #{pollCount}
          </span>
          <button
            onClick={handleNextPoll}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
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
            <p className="text-slate-500 text-xs mt-1">Click "Next Poll" above to keep voting endless questions.</p>
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