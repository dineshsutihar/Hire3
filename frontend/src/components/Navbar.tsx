import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom, isAuthedSelector, userSelector } from '../store/auth';
import Button from './Button';
import { Moon, Sun, LogOut } from 'lucide-react';
import React from 'react';

const baseLink = 'text-sm font-medium transition-colors';
const activeCls = ({ isActive }: { isActive: boolean }) => isActive ? `${baseLink} text-primary` : `${baseLink} text-muted hover:text-foreground`;

function useTheme() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => (localStorage.getItem('hire3_theme') as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
        localStorage.setItem('hire3_theme', theme);
    }, [theme]);
    return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}

export const Navbar = () => {
    const authed = useRecoilValue(isAuthedSelector);
    const user = useRecoilValue(userSelector);
    const setAuth = useSetRecoilState(authAtom);
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();

    const logout = () => {
        setAuth({ token: null, user: null, loading: false });
        navigate('/');
    };

    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('#nav-avatar-menu')) setOpen(false);
        };
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <nav className="app-container flex h-14 items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-lg font-semibold tracking-tight">Hire3</Link>
                    <div className="hidden md:flex items-center gap-5">
                        {authed && <NavLink to="/posts" className={activeCls}>Posts</NavLink>}
                        {authed && <NavLink to="/dashboard" className={activeCls}>Dashboard</NavLink>}
                        {authed && <NavLink to="/payments" className={activeCls}>Payments</NavLink>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button aria-label="Toggle theme" onClick={toggle} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background hover:bg-muted/10 transition-colors">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {!authed && <NavLink to="/login" className={activeCls}>Login</NavLink>}
                    {!authed && <Button asChild size="sm"><Link to="/register">Register</Link></Button>}
                    {authed && (
                        <div id="nav-avatar-menu" className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20 overflow-hidden"
                                aria-haspopup="menu" aria-expanded={open}
                            >
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name + ' avatar'} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="uppercase">{user?.name?.[0] || '?'} </span>
                                )}
                                <span className="sr-only">Open user menu</span>
                            </button>
                            {open && (
                                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-border/60 bg-background shadow-card animate-fade-in">
                                    <div className="px-3 py-2 border-b border-border/60">
                                        <p className="truncate text-sm font-medium">{user?.name}</p>
                                        <p className="truncate text-[11px] text-muted">{user?.email}</p>
                                    </div>
                                    <div className="py-1 text-sm">
                                        <Link to="/profile" className="block px-3 py-2 hover:bg-muted/10">Profile</Link>
                                        <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/10">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
