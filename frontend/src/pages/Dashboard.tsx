import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import { Card } from '../components/Card';
import { FindJobs } from './FindJobs';
import { CreateJobs } from './CreateJobs';
import { MyApplications } from './MyApplications';
import ManageJobs from './ManageJobs';
import { Briefcase, Search, FileText, Settings, Plus, TrendingUp, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import { getDashboardStats, type DashboardStats } from '../api/client';

type ActiveSection = 'overview' | 'find-jobs' | 'create-jobs' | 'my-applications' | 'manage-jobs';

interface QuickStatProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value, trend, trendUp }) => (
    <div className="card-surface p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {icon}
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {trend}
                </span>
            )}
        </div>
        <p className="mt-4 text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted mt-1">{label}</p>
    </div>
);

interface QuickActionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="card-surface p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group w-full"
    >
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-semibold group-hover:text-primary transition-colors">{title}</p>
                <p className="text-sm text-muted">{description}</p>
            </div>
            <ArrowRight size={18} className="text-muted group-hover:text-primary transition-colors" />
        </div>
    </button>
);

export const Dashboard = () => {
    const auth = useRecoilValue(authAtom);
    const [activeSection, setActiveSection] = React.useState<ActiveSection>('overview');
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = React.useState(true);

    React.useEffect(() => {
        if (auth.token) {
            setStatsLoading(true);
            getDashboardStats(auth.token)
                .then(setStats)
                .catch(console.error)
                .finally(() => setStatsLoading(false));
        }
    }, [auth.token]);

    const navigationItems = [
        {
            key: 'overview' as ActiveSection,
            label: 'Overview',
            icon: TrendingUp,
            description: 'Dashboard overview and quick actions'
        },
        {
            key: 'find-jobs' as ActiveSection,
            label: 'Browse Jobs',
            icon: Search,
            description: 'Browse and search for open jobs'
        },
        {
            key: 'create-jobs' as ActiveSection,
            label: 'Post a Job',
            icon: Plus,
            description: 'Post a new job opening'
        },
        {
            key: 'my-applications' as ActiveSection,
            label: 'Applications',
            icon: FileText,
            description: 'View your job applications'
        },
        {
            key: 'manage-jobs' as ActiveSection,
            label: 'My Job Posts',
            icon: Settings,
            description: 'Manage your posted jobs'
        }
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    Welcome back, {auth.user?.name?.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-muted mt-1">Here's what's happening with your account</p>
                            </div>
                            <Button onClick={() => setActiveSection('create-jobs')} className="gap-2">
                                <Plus size={18} /> Post New Job
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <QuickStat
                                icon={<Briefcase size={20} />}
                                label="Active Jobs"
                                value={statsLoading ? '...' : stats?.activeJobs ?? 0}
                                trend={stats?.recentJobs ? `+${stats.recentJobs} this week` : undefined}
                                trendUp={true}
                            />
                            <QuickStat
                                icon={<Users size={20} />}
                                label="Total Applicants"
                                value={statsLoading ? '...' : stats?.totalApplicants ?? 0}
                                trend={stats?.recentApplications ? `+${stats.recentApplications} new` : undefined}
                                trendUp={true}
                            />
                            <QuickStat
                                icon={<FileText size={20} />}
                                label="My Applications"
                                value={statsLoading ? '...' : stats?.myApplications ?? 0}
                            />
                            <QuickStat
                                icon={<Clock size={20} />}
                                label="Pending Reviews"
                                value={statsLoading ? '...' : stats?.pendingReviews ?? 0}
                            />
                        </div>

                        {/* Quick Actions & Recent Activity */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Quick Actions</h2>
                                <div className="space-y-3">
                                    <QuickAction
                                        icon={<Search size={20} />}
                                        title="Find Jobs"
                                        description="Browse opportunities matching your skills"
                                        onClick={() => setActiveSection('find-jobs')}
                                    />
                                    <QuickAction
                                        icon={<Plus size={20} />}
                                        title="Post a Job"
                                        description="Reach thousands of qualified candidates"
                                        onClick={() => setActiveSection('create-jobs')}
                                    />
                                    <QuickAction
                                        icon={<Settings size={20} />}
                                        title="Manage Jobs"
                                        description="Review applicants and update listings"
                                        onClick={() => setActiveSection('manage-jobs')}
                                    />
                                </div>
                            </div>

                            {/* Profile Completion */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Complete Your Profile</h2>
                                <Card className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted">Profile Strength</span>
                                            <span className="text-sm font-medium text-primary">
                                                {auth.user?.skills?.length ? '70%' : '30%'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                                                style={{ width: auth.user?.skills?.length ? '70%' : '30%' }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Add profile photo', done: false },
                                                { label: 'Add your skills', done: !!auth.user?.skills?.length },
                                                { label: 'Add LinkedIn URL', done: !!auth.user?.linkedin },
                                                { label: 'Add wallet address', done: !!auth.user?.wallet },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle
                                                        size={16}
                                                        className={item.done ? 'text-green-500' : 'text-muted'}
                                                    />
                                                    <span className={item.done ? 'text-muted line-through' : ''}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                {/* Getting Started Tips */}
                                <Card className="p-6 bg-primary/5 border-primary/20">
                                    <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
                                    <p className="text-sm text-muted">
                                        Complete profiles get 3x more visibility. Add your skills and work experience to stand out to employers.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </div>
                );
            case 'find-jobs':
                return <FindJobs />;
            case 'create-jobs':
                return <CreateJobs />;
            case 'my-applications':
                return <MyApplications />;
            case 'manage-jobs':
                return <ManageJobs />;
            default:
                return null;
        }
    };

    if (!auth.user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-8 text-center max-w-md">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Please log in</h2>
                    <p className="text-muted">You need to be logged in to access the dashboard.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <div className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-16 z-30">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center h-14 overflow-x-auto scrollbar-hide">
                        <nav className="flex items-center gap-1">
                            {navigationItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveSection(item.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeSection === item.key
                                        ? 'bg-primary text-white'
                                        : 'text-muted hover:text-foreground hover:bg-muted/10'
                                        }`}
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {renderActiveSection()}
            </div>
        </div>
    );
};

export default Dashboard;
