import React from 'react';
import { Card } from '../Card';
import { type Post } from '../../api/client';

export interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => (
    <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <span className="text-xs rounded bg-primary/10 text-primary px-2 py-0.5">{post.type}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
    </Card>
);

export default PostCard;
