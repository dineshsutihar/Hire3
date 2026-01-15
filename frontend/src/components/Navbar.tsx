import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom, isAuthedSelector, userSelector } from '../store/auth';
import Button from './Button';
import { Moon, Sun, LogOut, Menu, X, Briefcase, FileText, CreditCard, User, Home, Bell } from 'lucide-react';
import React from 'react';

const baseLink = 'text-sm font-medium transition-colors';
const activeCls = ({ isActive }: { isActive: boolean }) => isActive ? `${baseLink} text-primary` : `${baseLink} text-muted hover:text-foreground`;
const mobileActiveCls = ({ isActive }: { isActive: boolean }) => isActive
    ? 'flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-lg font-medium'
    : 'flex items-center gap-3 px-4 py-3 text-muted hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors';

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
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    // Close mobile menu on route change
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [navigate]);

    React.useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('#nav-avatar-menu')) setOpen(false);
        };
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    // Prevent body scroll when mobile menu is open
    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const navItems = [
        { to: '/posts', label: 'Posts', icon: FileText },
        { to: '/dashboard', label: 'Dashboard', icon: Briefcase },
        { to: '/payments', label: 'Payments', icon: CreditCard },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
            <nav className="app-container flex h-16 items-center justify-between gap-4">
                {/* Logo & Desktop Nav */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            H3
                        </div>
                        <span className="hidden sm:inline bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Hire3</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {authed && navItems.map(item => (
                            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
                                isActive
                                    ? 'px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg transition-colors'
                                    : 'px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors'
                            }>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        aria-label="Toggle theme"
                        onClick={toggle}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted/20 transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications (placeholder) */}
                    {authed && (
                        <button
                            aria-label="Notifications"
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted/20 transition-colors"
                        >
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                                3
                            </span>
                        </button>
                    )}

                    {/* Auth Buttons (Desktop) */}
                    {!authed && (
                        <div className="hidden sm:flex items-center gap-2">
                            <NavLink to="/login" className={activeCls}>Login</NavLink>
                            <Button asChild size="sm"><Link to="/register">Get Started</Link></Button>
                        </div>
                    )}

                    {/* User Menu (Desktop) */}
                    {authed && (
                        <div id="nav-avatar-menu" className="relative hidden sm:block">
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20 hover:border-primary/50 overflow-hidden transition-all"
                                aria-haspopup="menu" aria-expanded={open}
                            >
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name + ' avatar'} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="uppercase">{user?.name?.[0] || '?'}</span>
                                )}
                                <span className="sr-only">Open user menu</span>
                            </button>
                            {open && (
                                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-background shadow-lg animate-fade-in">
                                    <div className="px-4 py-3 border-b border-border/60 bg-muted/5">
                                        <p className="truncate text-sm font-semibold">{user?.name}</p>
                                        <p className="truncate text-xs text-muted mt-0.5">{user?.email}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/10 transition-colors">
                                            <User size={16} className="text-muted" />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/10 transition-colors">
                                            <Briefcase size={16} className="text-muted" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-border/60 py-2">
                                        <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                                            <LogOut size={16} />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted/20 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-lg md:hidden animate-fade-in">
                    <div className="flex flex-col h-full">
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {authed ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-muted/10 rounded-xl">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name + ' avatar'} className="h-full w-full object-cover rounded-full" />
                                            ) : (
                                                <span className="uppercase">{user?.name?.[0] || '?'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{user?.name}</p>
                                            <p className="text-sm text-muted truncate">{user?.email}</p>
                                        </div>
                                    </div>

                                    {/* Nav Items */}
                                    <NavLink to="/profile" className={mobileActiveCls} onClick={() => setMobileMenuOpen(false)}>
                                        <User size={20} /> My Profile
                                    </NavLink>
                                    {navItems.map(item => (
                                        <NavLink key={item.to} to={item.to} className={mobileActiveCls} onClick={() => setMobileMenuOpen(false)}>
                                            <item.icon size={20} /> {item.label}
                                        </NavLink>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" className={mobileActiveCls} onClick={() => setMobileMenuOpen(false)}>
                                        <Home size={20} /> Home
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        {/* Mobile Footer Actions */}
                        <div className="border-t border-border/60 p-4 space-y-3">
                            {authed ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-center gap-2 h-12 text-red-500 border-red-500/30 hover:bg-red-500/10"
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                >
                                    <LogOut size={18} /> Sign out
                                </Button>
                            ) : (
                                <div className="flex gap-3">
                                    <Button asChild variant="outline" className="flex-1 h-12">
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                    </Button>
                                    <Button asChild className="flex-1 h-12">
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
