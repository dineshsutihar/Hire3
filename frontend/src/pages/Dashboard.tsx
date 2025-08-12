import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import { Card } from '../components/Card';
import { FindJobs } from './FindJobs';
import { CreateJobs } from './CreateJobs';
import { MyApplications } from './MyApplications';
import ManageJobs from './ManageJobs';

type ActiveSection = 'find-jobs' | 'create-jobs' | 'my-applications' | 'manage-jobs';

export const Dashboard = () => {
    const auth = useRecoilValue(authAtom);
    const [activeSection, setActiveSection] = React.useState<ActiveSection>('find-jobs');

    const navigationItems = [
        {
            key: 'find-jobs' as ActiveSection,
            label: 'Browse Jobs',
            icon: '🔍',
            description: 'Browse and search for open jobs'
        },
        {
            key: 'create-jobs' as ActiveSection,
            label: 'Post a Job',
            icon: '📝',
            description: 'Post a new job opening'
        },
        {
            key: 'my-applications' as ActiveSection,
            label: 'Applications',
            icon: '📋',
            description: 'View your job applications'
        },
        {
            key: 'manage-jobs' as ActiveSection,
            label: 'My Job Posts',
            icon: '⚙️',
            description: 'Manage your posted jobs'
        }
    ];

    // Only render sections that match backend-supported features
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'find-jobs':
                return <FindJobs />;
            case 'create-jobs':
                return <CreateJobs />;
            case 'my-applications':
                return <MyApplications />;
            case 'manage-jobs':
                return <ManageJobs />;
            default:
                return <FindJobs />;
        }
    };

    if (!auth.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold mb-2">Please log in</h2>
                    <p className="text-muted-foreground">You need to be logged in to access the dashboard.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <div className="border-b border-border bg-background/95 backdrop-blur sticky">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center h-16">
                        <div className="flex items-center gap-10 mx-auto">
                            <span className="text-sm text-muted-foreground">
                                Welcome back, {auth.user.name}!
                            </span>
                            <nav className="hidden md:flex items-center gap-4">
                                {navigationItems.map(item => (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveSection(item.key)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeSection === item.key
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-b border-border bg-background">
                <div className="px-4 py-2">
                    <div className="grid grid-cols-2 gap-2">
                        {navigationItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => setActiveSection(item.key)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${activeSection === item.key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
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
