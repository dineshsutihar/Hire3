import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/auth';
import Button from '../Button';
import { useToast } from '../Toast';
import { createPost, type Post } from '../../api/client';

export interface PostComposerProps {
    onCreated: (p: Post) => void;
    onClose?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onCreated, onClose }) => {
    const auth = useRecoilValue(authAtom);
    const { notify } = useToast();
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [type, setType] = React.useState<'advice' | 'update'>('advice');
    const [tags, setTags] = React.useState('');
    const [posting, setPosting] = React.useState(false);

    const submit = async () => {
        if (!auth.token) return;
        if (!title.trim() || !content.trim()) {
            notify({ type: 'error', title: 'Missing fields', description: 'Title and content are required.' });
            return;
        }
        setPosting(true);
        try {
            const post = await createPost(auth.token, {
                title: title.trim(),
                content: content.trim(),
                type,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            setTitle(''); setContent(''); setTags(''); setType('advice');
            onCreated(post);
            notify({ type: 'success', title: 'Posted!', description: 'Your post has been published.' });
            onClose?.();
        } catch (e: any) {
            notify({ type: 'error', title: 'Post failed', description: e?.message || 'Could not create post.' });
        } finally { setPosting(false); }
    };

    return (
        <div className="grid gap-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title (e.g., Interview tips)" className="rounded border border-border bg-background px-3 py-2 text-sm" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your advice or update..." rows={6} className="rounded border border-border bg-background px-3 py-2 text-sm resize-y" />
            <div className="grid gap-3 md:grid-cols-3">
                <div>
                    <label className="block text-xs mb-1">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                        <option value="advice">Career Advice</option>
                        <option value="update">Update</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs mb-1">Tags (comma separated)</label>
                    <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., interviewing, resume, dev" className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={posting}>Cancel</Button>
                <Button onClick={submit} disabled={posting}>{posting ? 'Posting...' : 'Post'}</Button>
            </div>
        </div>
    );
};

export default PostComposer;
