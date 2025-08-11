import React from 'react';
import Button from '../Button';
import { Card } from '../Card';

interface JobCardProps {
    job: any;
    onViewApplicants: (job: any) => void;
    onCloseJob: (job: any) => void;
    getStatusColor: (status: string) => string;
    timeAgo: (dateString: string) => string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewApplicants, onCloseJob, getStatusColor, timeAgo }) => (
    <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    {job.location} • {job.workMode} • {job.salaryRange}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Posted {timeAgo(job.createdAt)}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); onViewApplicants(job); }}>View Applicants →</Button>
                {job.status !== 'closed' && (
                    <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); onCloseJob(job); }}>Close Job</Button>
                )}
            </div>
        </div>
    </Card>
);

export default JobCard;
