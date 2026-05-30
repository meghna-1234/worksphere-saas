import { useEffect, useState } from 'react';
import { supabase, Comment, Post, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';

type FeedComment = Comment & { author?: Profile };
type FeedPost = Post & {
  author?: Profile;
  comments?: FeedComment[];
  likedByCurrentUser?: boolean;
};

export function Feed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  const fetchPosts = async () => {
    setLoading(true);

    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) {
      setMessage({ type: 'error', text: postsError.message || 'Unable to load posts.' });
      setLoading(false);
      return;
    }

    const postIds = (postsData || []).map((post) => post.id);
    const authorIds = [...new Set((postsData || []).map((post) => post.author_id))];

    const [{ data: profilesData, error: profilesError }, { data: commentsData, error: commentsError }, { data: likesData, error: likesError }] =
      await Promise.all([
        authorIds.length
          ? supabase.from('profiles').select('*').in('user_id', authorIds)
          : Promise.resolve({ data: [], error: null }),
        postIds.length
          ? supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        postIds.length ? supabase.from('likes').select('*').in('post_id', postIds) : Promise.resolve({ data: [], error: null }),
      ]);

    if (profilesError || commentsError || likesError) {
      setMessage({
        type: 'error',
        text: profilesError?.message || commentsError?.message || likesError?.message || 'Unable to load feed activity.',
      });
    }

    const commentAuthorIds = [...new Set((commentsData || []).map((comment) => comment.author_id))];
    const missingCommentAuthorIds = commentAuthorIds.filter((authorId) => !authorIds.includes(authorId));
    const { data: commentProfilesData } = missingCommentAuthorIds.length
      ? await supabase.from('profiles').select('*').in('user_id', missingCommentAuthorIds)
      : { data: [] };

    const profilesByUserId = [...(profilesData || []), ...(commentProfilesData || [])].reduce<Record<string, Profile>>(
      (acc, authorProfile) => {
        acc[authorProfile.user_id] = authorProfile;
        return acc;
      },
      {},
    );

    const commentsByPostId = (commentsData || []).reduce<Record<string, FeedComment[]>>((acc, comment) => {
      if (!acc[comment.post_id]) acc[comment.post_id] = [];
      acc[comment.post_id].push({
        ...comment,
        author: profilesByUserId[comment.author_id],
      });
      return acc;
    }, {});

    const likesByPostId = (likesData || []).reduce<Record<string, any[]>>((acc, like) => {
      if (!acc[like.post_id]) acc[like.post_id] = [];
      acc[like.post_id].push(like);
      return acc;
    }, {});

    setPosts((postsData || []).map((post) => ({
      ...post,
      author: profilesByUserId[post.author_id],
      comments: commentsByPostId[post.id] || [],
      comments_count: commentsByPostId[post.id]?.length || post.comments_count || 0,
      likes_count: likesByPostId[post.id]?.length || post.likes_count || 0,
      likedByCurrentUser: !!user && !!likesByPostId[post.id]?.some((like) => like.user_id === user.id),
    })));
    setLoading(false);
  };

  const handleSubmitPost = async () => {
    const content = postContent.trim();
    setMessage(null);

    if (!content) {
      setMessage({ type: 'error', text: 'Please write something before posting.' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in to post.' });
      return;
    }

    setPosting(true);

    const { error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content,
        visibility: 'public',
      });

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to publish your post.' });
      setPosting(false);
      return;
    }

    setPostContent('');
    setMessage({ type: 'success', text: 'Post published successfully.' });
    await fetchPosts();
    setPosting(false);
  };

  const toggleLike = async (post: FeedPost) => {
    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in to like posts.' });
      return;
    }

    if (post.likedByCurrentUser) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
    }

    await fetchPosts();
  };

  const submitComment = async (postId: string) => {
    const content = (commentDrafts[postId] || '').trim();
    setMessage(null);

    if (!content) {
      setMessage({ type: 'error', text: 'Please write a comment before sending.' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in to comment.' });
      return;
    }

    setCommentingPostId(postId);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to add your comment.' });
      setCommentingPostId(null);
      return;
    }

    setCommentDrafts((drafts) => ({ ...drafts, [postId]: '' }));
    setOpenComments((open) => ({ ...open, [postId]: true }));
    setMessage({ type: 'success', text: 'Comment added.' });
    await fetchPosts();
    setCommentingPostId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium flex-shrink-0">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              placeholder={`What's on your mind, ${profile?.name?.split(' ')[0] || 'User'}?`}
              disabled={posting}
              className="w-full min-h-[96px] resize-none px-4 py-3 bg-slate-50 rounded-lg border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-colors text-slate-700 placeholder-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
            />
            {message && (
              <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                onClick={handleSubmitPost}
                disabled={posting || !postContent.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
        <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-md font-medium text-sm">For You</button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">Trending</button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">Companies</button>
        <button className="flex-1 py-2 px-4 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors">People</button>
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          No posts yet. Be the first to share an update.
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            commentDraft={commentDrafts[post.id] || ''}
            isCommenting={commentingPostId === post.id}
            showComments={!!openComments[post.id]}
            onLike={() => toggleLike(post)}
            onToggleComments={() => setOpenComments((open) => ({ ...open, [post.id]: !open[post.id] }))}
            onCommentChange={(value) => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: value }))}
            onSubmitComment={() => submitComment(post.id)}
          />
        ))
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
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
  );
}

function PostCard({
  post,
  commentDraft,
  isCommenting,
  showComments,
  onLike,
  onToggleComments,
  onCommentChange,
  onSubmitComment,
}: {
  post: FeedPost;
  commentDraft: string;
  isCommenting: boolean;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
}) {
  const postedAt = new Date(post.created_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-medium">
              {post.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{post.author?.name || 'Anonymous'}</div>
              <div className="flex items-center gap-2">
                {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>}
                <span className="text-sm text-slate-500">{postedAt}</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="text-slate-700 whitespace-pre-wrap">{post.content}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">#{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group ${
                post.likedByCurrentUser ? 'bg-red-50 text-red-600' : 'hover:bg-red-50'
              }`}
            >
              <Heart className={`w-5 h-5 transition-colors ${post.likedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-500'}`} />
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>
            <button onClick={onToggleComments} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group">
              <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-blue-600">{post.comments_count || 0}</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors group">
              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-green-600">Share</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors group">
              <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
          <div className="space-y-3">
            {(post.comments || []).length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              (post.comments || []).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{comment.author?.name || 'User'}</p>
                      <p className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              U
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="text"
                value={commentDraft}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder="Write a comment..."
                disabled={isCommenting}
                className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none disabled:opacity-60"
              />
              <button
                onClick={onSubmitComment}
                disabled={isCommenting || !commentDraft.trim()}
                className="p-1 hover:bg-blue-50 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
