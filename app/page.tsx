'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/today')
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Poll fetch error:', err);
        setLoading(false);
      });

    if (!localStorage.getItem('voter_id')) {
      localStorage.setItem('voter_id', uuidv4());
    }
  }, []);

  const handleVote = async (optionIndex: number) => {
    const voterId = localStorage.getItem('voter_id');
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question?.id, optionIndex, voterId }),
    });

    if (res.ok) {
      setHasVoted(true);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Loading today's poll...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Today's Global Poll
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
            {question?.text || 'Should artificial intelligence be regulated by international laws?'}
          </h1>
        </div>

        {!hasVoted ? (
          <div className="flex flex-col gap-3">
            {(question?.options || ['Yes, strictly', 'Yes, moderately', 'No, keep it open']).map(
              (option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className="w-full py-4 px-6 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-medium rounded-xl border border-slate-200 transition duration-200 text-left flex justify-between items-center group"
                >
                  <span>{option}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition">→</span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-1">Vote Registered!</h2>
            <p className="text-slate-600 text-sm">
              Thank you for sharing your opinion with the world.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}