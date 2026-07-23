import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageSquare, Send, User, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

const LessonDiscussions = ({ moduleId, user }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (moduleId) {
      fetchDiscussions();
    }
  }, [moduleId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    
    // Fetch top-level questions
    const { data: questions } = await supabase
      .from('lesson_discussions')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url),
        replies:lesson_discussions!parent_id(
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(full_name, avatar_url)
        )
      `)
      .eq('module_id', moduleId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (questions) {
      // Process replies
      const processedQuestions = questions.map(q => ({
        ...q,
        replies: q.replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
      }));
      setDiscussions(processedQuestions);
    }
    
    setLoading(false);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!user || !newQuestion.trim()) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('lesson_discussions')
      .insert({
        module_id: moduleId,
        user_id: user.id,
        content: newQuestion.trim()
      });

    if (!error) {
      setNewQuestion('');
      await fetchDiscussions();
    }
    
    setIsSubmitting(false);
  };

  const handleSubmitReply = async (parentId) => {
    if (!user || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('lesson_discussions')
      .insert({
        module_id: moduleId,
        user_id: user.id,
        content: replyContent.trim(),
        parent_id: parentId
      });

    if (!error) {
      setReplyContent('');
      setReplyingTo(null);
      setExpandedThreads(prev => new Set(prev).add(parentId));
      await fetchDiscussions();
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = async (id) => {
    if (!editContent.trim()) return;
    
    const { error } = await supabase
      .from('lesson_discussions')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setEditingId(null);
      setEditContent('');
      await fetchDiscussions();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    await supabase
      .from('lesson_discussions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    await fetchDiscussions();
  };

  const toggleThread = (id) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEdit = (discussion) => {
    setEditingId(discussion.id);
    setEditContent(discussion.content);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="font-display text-lg font-semibold text-white">
          Q&A Discussions
        </h3>
        <span className="px-2 py-0.5 bg-white/10 text-slate-400 text-xs rounded-full">
          {discussions.length}
        </span>
      </div>

      {/* New Question Form */}
      {user ? (
        <form onSubmit={handleSubmitQuestion} className="mb-6">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question about this lesson..."
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">
                Be specific and clear to get better answers
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !newQuestion.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Ask Question'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-slate-500 text-sm">
            Sign in to ask questions and join discussions
          </p>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] rounded-xl">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No questions yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Be the first to ask a question
            </p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
            >
              {/* Question */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {discussion.profiles?.avatar_url ? (
                      <img
                        src={discussion.profiles.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">
                        {discussion.profiles?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-slate-600 text-xs">
                        {new Date(discussion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {editingId === discussion.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500/50 focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleEdit(discussion.id)}
                            className="px-3 py-1 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-500 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent('');
                            }}
                            className="px-3 py-1 text-slate-400 text-xs hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                        {discussion.content}
                      </p>
                    )}
                    
                    {/* Actions */}
                    {editingId !== discussion.id && (
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => setReplyingTo(discussion.id)}
                          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Reply
                        </button>
                        {discussion.replies?.length > 0 && (
                          <button
                            onClick={() => toggleThread(discussion.id)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {expandedThreads.has(discussion.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                        
                        {/* Edit/Delete for owner */}
                        {user?.id === discussion.user_id && (
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              onClick={() => startEdit(discussion)}
                              className="text-slate-600 hover:text-slate-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(discussion.id)}
                              className="text-slate-600 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Reply Form */}
                {replyingTo === discussion.id && (
                  <div className="mt-4 ml-11">
                    <div className="bg-white/5 rounded-lg p-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full bg-transparent text-white text-sm placeholder-slate-500 resize-none focus:outline-none"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleSubmitReply(discussion.id)}
                          disabled={isSubmitting || !replyContent.trim()}
                          className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          className="px-3 py-1.5 text-slate-400 text-xs hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Replies */}
              {(expandedThreads.has(discussion.id) || discussion.replies?.length <= 2) && discussion.replies?.length > 0 && (
                <div className="border-t border-white/[0.06] bg-white/[0.02]">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="p-4 pl-12 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                          {reply.profiles?.avatar_url ? (
                            <img
                              src={reply.profiles.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-3 h-3 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm">
                              {reply.profiles?.full_name || 'Anonymous'}
                            </span>
                            <span className="text-slate-600 text-xs">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonDiscussions;
