import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom, userSelector } from '../store/auth';
import { Card, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { listPosts, getMyPosts, type Post } from '../api/client';
import { Image as ImageIcon, Video, FileText } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostCard from '../components/posts/PostCard';

const Posts: React.FC = () => {
    const auth = useRecoilValue(authAtom);
    const user = useRecoilValue(userSelector);
    const { notify } = useToast();
    const [feed, setFeed] = React.useState<Post[]>([]);
    const [myPosts, setMyPosts] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [composerOpen, setComposerOpen] = React.useState(false);

    const load = React.useCallback(async () => {
        setLoading(true);
        try {
            const [all, mine] = await Promise.all([
                listPosts(),
                auth.token ? getMyPosts(auth.token) : Promise.resolve([] as Post[]),
            ]);
            setFeed(all);
            setMyPosts(mine);
        } catch (e: any) {
            notify({ type: 'error', title: 'Load failed', description: e?.message || 'Could not load posts.' });
        } finally { setLoading(false); }
    }, [auth.token, notify]);

    React.useEffect(() => { load(); }, [load]);

    const onCreated = (p: Post) => {
        setFeed(prev => [p, ...prev]);
        setMyPosts(prev => [p, ...prev]);
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
            {auth.token && (
                <Card className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                (user?.name?.[0] || '?').toUpperCase()
                            )}
                        </div>
                        <button onClick={() => setComposerOpen(true)} className="flex-1 text-left rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-muted/10">
                            Start a post
                        </button>
                    </div>
                    <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Video size={16} /> Video</span>
                        <span className="inline-flex items-center gap-1"><ImageIcon size={16} /> Photo</span>
                        <span className="inline-flex items-center gap-1"><FileText size={16} /> Write article</span>
                    </div>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {/* Left: My Posts */}
                <div className="space-y-3 order-2 md:order-1">
                    <Card className="p-4">
                        <CardTitle className="mb-3 text-base">My Posts</CardTitle>
                        <div className="space-y-2">
                            {myPosts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
                            {myPosts.map(p => (
                                <div key={p.id} className="border-b border-border/50 pb-2">
                                    <p className="text-sm font-medium">{p.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right: Feed */}
                <div className="md:col-span-2 space-y-3 order-1 md:order-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Latest Posts</h2>
                        <Button variant="outline" size="sm" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
                    </div>
                    {feed.length === 0 && !loading && (
                        <Card className="p-6 text-center text-sm text-muted-foreground">No posts yet.</Card>
                    )}
                    {feed.map(p => <PostCard key={p.id} post={p} />)}
                </div>
            </div>

            {/* Composer Modal */}
            {composerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setComposerOpen(false)} />
                    <div className="relative z-10 w-full max-w-2xl rounded-md border border-border bg-background shadow-xl">
                        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                            <h3 className="text-base font-semibold">Create a Post</h3>
                            <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setComposerOpen(false)}>✕</button>
                        </div>
                        <div className="p-4">
                            <PostComposer onCreated={onCreated} onClose={() => setComposerOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Posts;
