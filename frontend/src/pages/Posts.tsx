import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom, userSelector } from '../store/auth';
import { Card } from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { listPosts, getMyPosts, type Post } from '../api/client';
import { Image as ImageIcon, Video, FileText, PenSquare, TrendingUp, Users, Sparkles, RefreshCw } from 'lucide-react';
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
    const [activeFilter, setActiveFilter] = React.useState<'all' | 'advice' | 'update'>('all');

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
        } finally {
            setLoading(false);
        }
    }, [auth.token, notify]);

    React.useEffect(() => { load(); }, [load]);

    const onCreated = (p: Post) => {
        setFeed(prev => [p, ...prev]);
        setMyPosts(prev => [p, ...prev]);
    };

    const filteredFeed = activeFilter === 'all' 
        ? feed 
        : feed.filter(p => p.type.toLowerCase() === activeFilter);

    const trendingTags = ['web3', 'remote', 'startup', 'career', 'interviewing'];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-b border-border/50">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                Community Feed
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Share insights, get advice, and connect with professionals
                            </p>
                        </div>
                        {auth.token && (
                            <Button onClick={() => setComposerOpen(true)} className="gap-2 shadow-lg">
                                <PenSquare size={18} />
                                Create Post
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-3 space-y-4 hidden lg:block">
                        {auth.token && user && (
                            <Card className="p-0 overflow-hidden">
                                <div className="h-16 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
                                <div className="px-4 pb-4">
                                    <div className="-mt-8 mb-3">
                                        <div className="h-16 w-16 rounded-full border-4 border-background bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                (user.name?.[0] || '?').toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{user.bio || 'Web3 Professional'}</p>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Your posts</span>
                                            <span className="font-semibold text-primary">{myPosts.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={16} className="text-primary" />
                                <h3 className="font-semibold text-sm">Trending Topics</h3>
                            </div>
                            <div className="space-y-2">
                                {trendingTags.map((tag) => (
                                    <button
                                        key={tag}
                                        className="flex items-center justify-between w-full text-left hover:bg-muted/10 px-2 py-1.5 rounded-lg transition-colors group"
                                    >
                                        <span className="text-sm text-muted-foreground group-hover:text-primary">#{tag}</span>
                                        <span className="text-xs text-muted-foreground/60">{Math.floor(Math.random() * 50) + 10} posts</span>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-6 space-y-4">
                        {auth.token && (
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                                        ) : (
                                            (user?.name?.[0] || '?').toUpperCase()
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setComposerOpen(true)} 
                                        className="flex-1 text-left rounded-full border border-border bg-muted/10 hover:bg-muted/20 px-5 py-3 text-sm text-muted-foreground transition-colors"
                                    >
                                        Share your thoughts, {user?.name?.split(' ')[0]}...
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-around">
                                    <button 
                                        onClick={() => setComposerOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/10 text-muted-foreground transition-colors"
                                    >
                                        <ImageIcon size={20} className="text-green-500" />
                                        <span className="text-sm font-medium hidden sm:inline">Photo</span>
                                    </button>
                                    <button 
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/10 text-muted-foreground transition-colors opacity-50 cursor-not-allowed"
                                        disabled
                                    >
                                        <Video size={20} className="text-blue-500" />
                                        <span className="text-sm font-medium hidden sm:inline">Video</span>
                                    </button>
                                    <button 
                                        onClick={() => setComposerOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/10 text-muted-foreground transition-colors"
                                    >
                                        <FileText size={20} className="text-orange-500" />
                                        <span className="text-sm font-medium hidden sm:inline">Article</span>
                                    </button>
                                </div>
                            </Card>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-lg">
                                {[
                                    { key: 'all', label: 'All Posts' },
                                    { key: 'advice', label: '💡 Advice' },
                                    { key: 'update', label: '📢 Updates' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            activeFilter === tab.key
                                                ? 'bg-background shadow-sm text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={load}
                                disabled={loading}
                                className="p-2 rounded-lg hover:bg-muted/20 text-muted-foreground transition-colors disabled:opacity-50"
                                title="Refresh feed"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {loading && feed.length === 0 && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <Card key={i} className="p-4 animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-12 w-12 rounded-full bg-muted" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-32 bg-muted rounded" />
                                                    <div className="h-3 w-20 bg-muted rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-full bg-muted rounded" />
                                                <div className="h-4 w-3/4 bg-muted rounded" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {!loading && filteredFeed.length === 0 && (
                                <Card className="p-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                        <Sparkles size={28} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Be the first to share something with the community!
                                    </p>
                                    {auth.token && (
                                        <Button onClick={() => setComposerOpen(true)}>
                                            Create First Post
                                        </Button>
                                    )}
                                </Card>
                            )}

                            {filteredFeed.map(p => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-3 space-y-4 hidden lg:block">
                        {auth.token && myPosts.length > 0 && (
                            <Card className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">Your Recent Posts</h3>
                                </div>
                                <div className="space-y-3">
                                    {myPosts.slice(0, 3).map(p => (
                                        <div key={p.id} className="group cursor-pointer">
                                            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                                {p.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{p.likeCount || 0} likes</span>
                                            </div>
                                        </div>
                                    ))}
                                    {myPosts.length > 3 && (
                                        <button className="text-sm text-primary font-medium hover:underline">
                                            View all {myPosts.length} posts →
                                        </button>
                                    )}
                                </div>
                            </Card>
                        )}

                        <Card className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={16} className="text-primary" />
                                <h3 className="font-semibold text-sm">Community</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Posts</span>
                                    <span className="font-semibold">{feed.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Career Advice</span>
                                    <span className="font-semibold">{feed.filter(p => p.type === 'advice').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Updates</span>
                                    <span className="font-semibold">{feed.filter(p => p.type === 'update').length}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                            <h3 className="font-semibold text-sm mb-2">📝 Posting Guidelines</h3>
                            <ul className="text-xs text-muted-foreground space-y-1.5">
                                <li>• Share valuable career insights</li>
                                <li>• Be respectful and professional</li>
                                <li>• Use relevant tags for visibility</li>
                                <li>• Engage with others' posts</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Composer Modal */}
            {composerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setComposerOpen(false)} />
                    <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl">
                        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Create a Post</h3>
                            <button 
                                className="p-2 rounded-lg hover:bg-muted/20 text-muted-foreground transition-colors" 
                                onClick={() => setComposerOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <PostComposer onCreated={onCreated} onClose={() => setComposerOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Posts;
