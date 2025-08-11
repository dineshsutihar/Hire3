import React from 'react';
import { Card } from '../Card';


interface JobStatsProps {
    jobs: any[];
    totalApplications: number;
}

const JobStats: React.FC<JobStatsProps> = ({ jobs, totalApplications }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{jobs.length}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
            </Card>
            <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalApplications}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
            </Card>
        </div>
    );
};

export default JobStats;
