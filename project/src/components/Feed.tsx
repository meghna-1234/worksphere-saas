import React, { useState, useEffect } from 'react';
import { supabase, Post, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';

export function Feed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setPosts(data);
    setLoading(false);
  };

  const toggleLike = async (postId: string) => {
    const { data: existing } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', profile?.user_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_likes', { post_id: postId });
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: profile?.user_id });
      await supabase.rpc('increment_likes', { post_id: postId });
    }

    fetchPosts();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium flex-shrink-0">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <button className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              What's on your mind, {profile?.name?.split(' ')[0] || 'User'}?
            </button>
            <div className="flex items-center gap-4 mt-3">
              <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Photo
              </button>
              <button className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors text-sm">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Article
              </button>
              <button className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors text-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A5.001 5.001 0 0117.5 13a5.001 5.001 0 01-4.901 3.96A5 5 0 0112 18.5h-.5a5 5 0 01-4.901-3.96A5.001 5.001 0 017.5 13a5.001 5.001 0 01-4.901 1.96A5.001 5.001 0 017 18a5.001 5.001 0 011.596 2.595C9.564 22.33 11.065 24 12.75 24c1.685 0 3.186-1.67 4.154-3.405A5.001 5.001 0 0118 18a5.001 5.001 0 014.344-3.04z" />
                  </svg>
                </div>
                Poll
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
        <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-md font-medium text-sm">
          For You
        </button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
          Trending
        </button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
          Companies
        </button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">
          People
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
        ))
      )}
    </div>
  );
}

function PostCard({ post, onLike }: { post: Post; onLike: () => void }) {
  const [showComments, setShowComments] = useState(false);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      student: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Student' },
      employee: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Employee' },
      hr: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'HR' },
      company_admin: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Company' },
    };
    return badges[role] || badges.student;
  };

  const badge = post.author ? getRoleBadge(post.author.role) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-medium">
              {post.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{post.author?.name || 'Anonymous'}</div>
              <div className="flex items-center gap-2">
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                )}
                <span className="text-sm text-slate-500">{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="text-slate-700 whitespace-pre-wrap">{post.content}</div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              onClick={onLike}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <Heart className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-red-600">{post.likes_count}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-blue-600">{post.comments_count}</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors group">
              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-green-600">Share</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors group">
              <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              U
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none"
              />
              <button className="p-1 hover:bg-blue-50 rounded transition-colors">
                <Send className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
