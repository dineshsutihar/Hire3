import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom, userSelector } from '../../store/auth';
import Button from '../Button';
import { useToast } from '../Toast';
import { createPost, type Post } from '../../api/client';
import { Image as ImageIcon, Video, FileText, X, Send, Trash2 } from 'lucide-react';

export interface PostComposerProps {
    onCreated: (p: Post) => void;
    onClose?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onCreated, onClose }) => {
    const auth = useRecoilValue(authAtom);
    const user = useRecoilValue(userSelector);
    const { notify } = useToast();
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [type, setType] = React.useState<'advice' | 'update'>('advice');
    const [tags, setTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState('');
    const [posting, setPosting] = React.useState(false);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
        }
    }, [content]);

    const addTag = (tag: string) => {
        const cleaned = tag.trim().toLowerCase().replace(/^#/, '');
        if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
            setTags([...tags, cleaned]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            notify({ type: 'error', title: 'Invalid file', description: 'Only JPEG, PNG, GIF, and WebP images are allowed.' });
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            notify({ type: 'error', title: 'File too large', description: 'Maximum image size is 10MB.' });
            return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

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
                tags,
                image: imageFile || undefined,
            });
            setTitle(''); setContent(''); setTags([]); setType('advice');
            removeImage();
            onCreated(post);
            notify({ type: 'success', title: 'Posted!', description: 'Your post has been published.' });
            onClose?.();
        } catch (e: any) {
            notify({ type: 'error', title: 'Post failed', description: e?.message || 'Could not create post.' });
        } finally { setPosting(false); }
    };

    const suggestedTags = ['career', 'interviewing', 'resume', 'web3', 'remote', 'startup'];

    return (
        <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-lg font-bold overflow-hidden">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        (user?.name?.[0] || '?').toUpperCase()
                    )}
                </div>
                <div>
                    <p className="font-semibold">{user?.name || 'User'}</p>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as 'advice' | 'update')}
                        className="text-xs bg-muted/10 border border-border rounded-md px-2 py-1 mt-0.5"
                    >
                        <option value="advice">💡 Career Advice</option>
                        <option value="update">📢 Update</option>
                    </select>
                </div>
            </div>

            {/* Title Input */}
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/60"
                maxLength={100}
            />

            {/* Content Textarea */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What do you want to share? Share your thoughts, insights, or updates..."
                rows={4}
                className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/60"
            />

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/5">
                    <img
                        src={imagePreview}
                        alt="Post preview"
                        className="w-full max-h-80 object-contain"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        title="Remove image"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                        {imageFile?.name} ({((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </div>
                </div>
            )}

            {/* Tags Section */}
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-muted/5 rounded-lg border border-border/50">
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tags.length === 0 ? "Add tags (press Enter)..." : tags.length < 5 ? "Add more..." : ""}
                        disabled={tags.length >= 5}
                        className="flex-1 min-w-[100px] text-sm bg-transparent border-none outline-none"
                    />
                </div>
                {tags.length === 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs text-muted-foreground">Suggested:</span>
                        {suggestedTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => addTag(tag)}
                                className="text-xs text-primary hover:underline"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Actions Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {/* Hidden file input */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="post-image-upload"
                    />
                    <label
                        htmlFor="post-image-upload"
                        className={`p-2 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer ${imagePreview ? 'text-primary' : 'text-muted-foreground'}`}
                        title="Add image"
                    >
                        <ImageIcon size={20} />
                    </label>
                    <button className="p-2 rounded-lg hover:bg-muted/10 text-muted-foreground/40 transition-colors cursor-not-allowed" title="Video (coming soon)" disabled>
                        <Video size={20} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted/10 text-muted-foreground/40 transition-colors cursor-not-allowed" title="Document (coming soon)" disabled>
                        <FileText size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {onClose && (
                        <Button variant="outline" size="sm" onClick={onClose} disabled={posting}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={submit}
                        disabled={posting || !title.trim() || !content.trim()}
                        className="gap-2"
                    >
                        {posting ? (
                            <>Posting...</>
                        ) : (
                            <>
                                <Send size={16} />
                                Post
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Character count */}
            <div className="text-xs text-muted-foreground text-right">
                {content.length}/3000
            </div>
        </div>
    );
};

export default PostComposer;
