'use client';

import { useEffect, useState } from 'react';

export default function AdminPortal() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Live User Comments & Feedback</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            Total Comments: {comments.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading feedback...</div>
        ) : comments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-500">
            No comments submitted yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {comments.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Poll ID: {item.question_id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-medium mt-2">{item.comment_text}</p>
                <div className="mt-3 text-xs text-slate-400">
                  Voter ID: {item.voter_id?.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}