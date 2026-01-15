import React from 'react';
import Button from '../Button';
import { Card } from '../Card';
import { MapPin, Briefcase, DollarSign, Clock, Users, Eye, MoreVertical, Archive, Edit, Trash2 } from 'lucide-react';

interface JobCardProps {
    job: any;
    onViewApplicants: (job: any) => void;
    onCloseJob: (job: any) => void;
    getStatusColor: (status: string) => string;
    timeAgo: (dateString: string) => string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewApplicants, onCloseJob, getStatusColor, timeAgo }) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
        active: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
        closed: { bg: 'bg-gray-100 dark:bg-neutral-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
        draft: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
    };

    const status = statusConfig[job.status] || statusConfig.active;

    return (
        <Card className="p-0 overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Left content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="text-xl font-semibold truncate">{job.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                        </div>

                        {/* Job Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            {job.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                </span>
                            )}
                            {job.workMode && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" />
                                    {job.workMode}
                                </span>
                            )}
                            {job.budget && (
                                <span className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4" />
                                    {job.budget}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {timeAgo(job.createdAt)}
                            </span>
                        </div>

                        {/* Skills Preview */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {job.skills.slice(0, 4).map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {job.skills.length > 4 && (
                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                        +{job.skills.length - 4} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1.5 text-blue-600">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">{job.applicantCount || 0}</span>
                                <span className="text-muted-foreground">applicants</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-purple-600">
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">{job.viewCount || 0}</span>
                                <span className="text-muted-foreground">views</span>
                            </div>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-col items-end gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </button>
                            {menuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border z-20 py-1">
                                        <button
                                            onClick={() => { setMenuOpen(false); /* TODO: Edit */ }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Job
                                        </button>
                                        {job.status !== 'closed' && (
                                            <button
                                                onClick={() => { setMenuOpen(false); onCloseJob(job); }}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                                            >
                                                <Archive className="h-4 w-4" />
                                                Close Job
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setMenuOpen(false); /* TODO: Delete */ }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2 text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Job
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            onClick={(e) => { e.stopPropagation(); onViewApplicants(job); }}
                            className="whitespace-nowrap"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            View Applicants
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default JobCard;
