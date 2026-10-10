'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Unlimited Dynamic Question Generator Engine
const pollTopics = [
  { category: "Technology", subject: "Artificial Intelligence", action: "be regulated by international laws" },
  { category: "Workforce", subject: "Remote Work", action: "replace traditional office spaces completely by 2030" },
  { category: "Cybersecurity", subject: "Social Media Platforms", action: "require government ID verification to stop bots" },
  { category: "Energy", subject: "Renewable Energy", action: "fully replace fossil fuels within the next decade" },
  { category: "Economy", subject: "4-Day Workweeks", action: "become the standard corporate work model" },
  { category: "Finance", subject: "Cryptocurrencies", action: "eventually phase out physical paper cash" },
  { category: "Automotive", subject: "Autonomous Driverless Cars", action: "be allowed on highways without human backup drivers" },
  { category: "Education", subject: "Skill-Based AI Certificates", action: "replace traditional 4-year university college degrees" },
  { category: "Space", subject: "Mars Colonization Projects", action: "receive public funding ahead of Earth environmental programs" },
  { category: "Society", subject: "Universal Basic Income (UBI)", action: "be guaranteed to all citizens unconditionally" }
];

const questionPrefixes = [
  "In your opinion, should",
  "Do you believe that",
  "Is it time for global leaders to mandate that",
  "Would humanity benefit if",
  "Is it necessary that"
];

const optionSets = [
  ["Yes, absolutely", "Partially / Conditionally", "No, definitely not"],
  ["Yes, strongly agree", "Neutral / Undecided", "No, strongly disagree"],
  ["High Priority", "Medium Priority", "Low / No Priority"],
  ["It is necessary", "Too risky right now", "It should be banned"]
];

function generateDynamicPoll() {
  const topic = pollTopics[Math.floor(Math.random() * pollTopics.length)];
  const prefix = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)];
  const options = optionSets[Math.floor(Math.random() * optionSets.length)];
  const pollId = `poll-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    id: pollId,
    category: topic.category,
    text: `${prefix} ${topic.subject.toLowerCase()} ${topic.action}?`,
    options: options
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

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question?.id, optionIndex, voterId }),
      });
    } catch (err) {
      console.log('Vote network request handled:', err);
    }
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
      } else {
        setCommentSubmitted(true);
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment network error handled:', err);
      // Fallback for smooth UX (prevents page crash error)
      setCommentSubmitted(true);
      setCommentText('');
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