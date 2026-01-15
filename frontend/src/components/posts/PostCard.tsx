import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/auth';
import { Card } from '../Card';
import { type Post, type Comment, likePost, unlikePost, getPostComments, addComment, deleteComment } from '../../api/client';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Send, X, Trash2 } from 'lucide-react';

export interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const auth = useRecoilValue(authAtom);
    const [liked, setLiked] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(post.likeCount || 0);
    const [showComments, setShowComments] = React.useState(false);
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [commentText, setCommentText] = React.useState('');
    const [loadingComments, setLoadingComments] = React.useState(false);
    const [submittingComment, setSubmittingComment] = React.useState(false);

    const handleLike = async () => {
        if (!auth.token) return;
        try {
            if (liked) {
                const res = await unlikePost(auth.token, post.id);
                setLikeCount(res.likeCount);
                setLiked(false);
            } else {
                const res = await likePost(auth.token, post.id);
                setLikeCount(res.likeCount);
                setLiked(true);
            }
        } catch (err) {
            console.error('Failed to like/unlike:', err);
        }
    };

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const data = await getPostComments(post.id);
            setComments(data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            loadComments();
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.token || !commentText.trim()) return;
        
        setSubmittingComment(true);
        try {
            const newComment = await addComment(auth.token, post.id, commentText.trim());
            setComments(prev => [newComment, ...prev]);
            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!auth.token) return;
        try {
            await deleteComment(auth.token, commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTypeStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'advice':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            case 'update':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            default:
                return 'bg-primary/10 text-primary';
        }
    };

    return (
        <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {post.user?.avatarUrl ? (
                        <img
                            src={post.user.avatarUrl}
                            alt={post.user.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                            {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{post.user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${getTypeStyle(post.type)}`}>
                        {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                        <MoreHorizontal size={18} className="text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <h3 className="font-bold text-base mb-2 leading-tight">{post.title}</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {post.content}
                </p>
                {post.content.length > 300 && (
                    <button className="text-sm text-primary font-medium mt-1 hover:underline">
                        ...see more
                    </button>
                )}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
                <div className="relative">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full max-h-[500px] object-cover"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-primary hover:underline cursor-pointer">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <ThumbsUp size={10} className="text-white" />
                    </div>
                    <span>{likeCount}</span>
                </div>
                <button onClick={handleToggleComments} className="hover:underline">
                    {post.commentCount || comments.length} comments
                </button>
            </div>

            {/* Actions */}
            <div className="px-2 py-1.5 border-t border-border/50 flex items-center justify-around">
                <button
                    onClick={handleLike}
                    disabled={!auth.token}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${liked
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-muted-foreground hover:bg-muted/10'
                        } ${!auth.token ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ThumbsUp size={18} className={liked ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">Like</span>
                </button>
                <button 
                    onClick={handleToggleComments}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${showComments
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-muted-foreground hover:bg-muted/10'
                        }`}
                >
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors">
                    <Share2 size={18} />
                    <span className="text-sm font-medium">Share</span>
                </button>
                <button
                    onClick={() => setSaved(!saved)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${saved
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                        : 'text-muted-foreground hover:bg-muted/10'
                        }`}
                >
                    <Bookmark size={18} className={saved ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">Save</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-border/50">
                    {/* Comment Input */}
                    {auth.token && (
                        <form onSubmit={handleSubmitComment} className="p-4 flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 text-sm bg-muted/20 rounded-full border border-border/50 focus:outline-none focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || submittingComment}
                                className="p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    )}

                    {/* Comments List */}
                    <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
                        {loadingComments ? (
                            <p className="text-sm text-muted-foreground text-center py-2">Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2 group">
                                    {comment.user?.avatarUrl ? (
                                        <img
                                            src={comment.user.avatarUrl}
                                            alt={comment.user.name}
                                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-muted/20 rounded-xl px-3 py-2">
                                            <p className="text-sm font-semibold">{comment.user?.name || 'User'}</p>
                                            <p className="text-sm">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>{formatDate(comment.createdAt)}</span>
                                            {auth.user && comment.userId === auth.user.email && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PostCard;
