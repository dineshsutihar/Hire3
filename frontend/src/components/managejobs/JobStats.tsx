import React from 'react';
import { Card } from '../Card';
import { Briefcase, Users, Eye, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface JobStatsProps {
    jobs: any[];
    totalApplications: number;
    totalViews?: number;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    trend?: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => (
    <Card className="p-5 relative overflow-hidden">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                {trend && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
                {icon}
            </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${color.replace('text-', 'bg-')}`} />
    </Card>
);

const JobStats: React.FC<JobStatsProps> = ({ jobs, totalApplications, totalViews = 0 }) => {
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const closedJobs = jobs.filter(j => j.status === 'closed').length;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Briefcase className="h-5 w-5 text-primary" />}
                    label="Active Jobs"
                    value={activeJobs}
                    color="text-primary"
                />
                <StatCard
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    label="Total Applications"
                    value={totalApplications}
                    color="text-blue-600"
                />
                <StatCard
                    icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                    label="Closed Jobs"
                    value={closedJobs}
                    color="text-green-600"
                />
                <StatCard
                    icon={<Eye className="h-5 w-5 text-purple-600" />}
                    label="Total Views"
                    value={totalViews || jobs.reduce((acc, j) => acc + (j.viewCount || 0), 0)}
                    color="text-purple-600"
                />
            </div>
        </div>
    );
};

export default JobStats;
