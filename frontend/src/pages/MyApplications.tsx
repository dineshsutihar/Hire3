import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { useToast } from '../components/Toast';
import { getUserApplications } from '../api/client';
import { MapPin, Briefcase, IndianRupee, Clock, Check, X } from 'lucide-react';

interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    appliedAt: string;
    status?: 'applied' | 'rejected';
    location?: string;
    workMode?: string;
    budget?: string;
}

export const MyApplications = () => {
    const auth = useRecoilValue(authAtom);
    const { notify } = useToast();
    const [applications, setApplications] = React.useState<Application[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [filter, setFilter] = React.useState<'all' | 'applied' | 'rejected'>('all');

    React.useEffect(() => {
        const fetchApplications = async () => {
            if (!auth.token) return;

            setLoading(true);
            try {
                const response = await getUserApplications(auth.token);
                const formattedApplications: Application[] = response.applications.map(app => ({
                    id: app.id,
                    jobId: app.jobId,
                    jobTitle: app.job.title,
                    appliedAt: app.createdAt,
                    status: app.status === 'pending' ? 'applied' : 'rejected',
                    location: app.job.location,
                    workMode: app.job.workMode,
                    budget: app.job.budget,
                }));
                setApplications(formattedApplications);
            } catch (error: any) {
                console.error('Failed to fetch applications:', error);
                notify({
                    type: 'error',
                    title: 'Error',
                    description: 'Failed to load applications'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [auth.token, notify]);

    const filteredApplications = applications.filter(app =>
        filter === 'all' || app.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
            case 'rejected': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
            default: return 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'applied': return <Check className="inline w-4 h-4" />;
            case 'rejected': return <X className="inline w-4 h-4" />;
            default: return '?';
        }
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const applicationCounts = applications.reduce((acc, app) => {
        if (app.status) {
            acc[app.status] = (acc[app.status] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading your applications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Application Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{applications.length}</div>
                    <div className="text-sm text-muted-foreground">Total Applications</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{applicationCounts.applied || 0}</div>
                    <div className="text-sm text-muted-foreground">Applied</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{applicationCounts.rejected || 0}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { key: 'all', label: 'All Applications', count: applications.length },
                    { key: 'applied', label: 'Applied', count: applicationCounts.applied || 0 },
                    { key: 'rejected', label: 'Rejected', count: applicationCounts.rejected || 0 }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === tab.key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:bg-muted'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="text-muted-foreground mb-4">
                            {filter === 'all'
                                ? "You haven't applied to any jobs yet."
                                : `No ${filter} applications found.`
                            }
                        </div>
                        {filter === 'all' && (
                            <Button onClick={() => window.location.href = '/find-jobs'}>
                                Browse Jobs
                            </Button>
                        )}
                    </Card>
                ) : (
                    filteredApplications.map(application => (
                        <Card key={application.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold">{application.jobTitle}</h3>
                                        {application.status && (
                                            <span className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                                                <span>{getStatusIcon(application.status)}</span>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Company name not available in backend response */}


                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                                        {application.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="inline w-4 h-4" /> {application.location}
                                            </span>
                                        )}
                                        {application.workMode && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="inline w-4 h-4" /> {application.workMode}
                                            </span>
                                        )}
                                        {application.budget && (
                                            <span className="flex items-center gap-1">
                                                <IndianRupee className="inline w-4 h-4" /> {application.budget} Rupees
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="inline w-4 h-4" />
                                        Applied {timeAgo(application.appliedAt)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/jobs/${application.jobId}`, '_blank')}
                                    >
                                        View Job
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyApplications;
