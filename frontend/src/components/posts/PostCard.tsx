import React from 'react';
import { Card } from '../Card';
import { type Post } from '../../api/client';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp } from 'lucide-react';

export interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [liked, setLiked] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(Math.floor(Math.random() * 50) + 1);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
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
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                        {post.userId?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">User</p>
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
                <span>{Math.floor(Math.random() * 10)} comments</span>
            </div>

            {/* Actions */}
            <div className="px-2 py-1.5 border-t border-border/50 flex items-center justify-around">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${liked
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-muted-foreground hover:bg-muted/10'
                        }`}
                >
                    <ThumbsUp size={18} className={liked ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors">
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
        </Card>
    );
};

export default PostCard;
