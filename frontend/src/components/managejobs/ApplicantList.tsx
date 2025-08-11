import React from 'react';
import Button from '../Button';
import { Card } from '../Card';

interface ApplicantListProps {
    applicants: any[];
    applicantsLoading: boolean;
    applicantFilter: string;
    setApplicantFilter: (filter: string) => void;
    getStatusColor: (status: string) => string;
    timeAgo: (dateString: string) => string;
    onViewProfile: (applicant: any) => void;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

const ApplicantList: React.FC<ApplicantListProps> = ({
    applicants,
    applicantsLoading,
    applicantFilter,
    setApplicantFilter,
    getStatusColor,
    timeAgo,
    onViewProfile,
    onAccept,
    onReject,
}) => {
    const applicantCounts = applicants.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const filteredApplicants = applicantFilter === 'all'
        ? applicants
        : applicants.filter(app => app.status === applicantFilter);

    return (
        <>
            {/* Applicant Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { key: 'all', label: 'All Applicants', count: applicants.length },
                    { key: 'accepted', label: 'Accepted', count: applicantCounts.accepted || 0 },
                    { key: 'rejected', label: 'Rejected', count: applicantCounts.rejected || 0 }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setApplicantFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${applicantFilter === tab.key
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>
            {/* Applicants List */}
            <div className="space-y-4">
                {applicantsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="ml-2 text-muted-foreground">Loading applicants...</span>
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-muted-foreground mb-2">No applicants found</div>
                        <p className="text-sm text-muted-foreground">
                            {applicantFilter === 'all'
                                ? 'No one has applied to this job yet.'
                                : `No applicants with status "${applicantFilter}".`
                            }
                        </p>
                    </Card>
                ) : (
                    filteredApplicants.map(applicant => (
                        <Card key={applicant.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                                            {applicant.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(applicant.status)}`}>
                                                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground mb-2">{applicant.email}</p>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {applicant.skills.slice(0, 5).map((skill: string) => (
                                                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {applicant.skills.length > 5 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                        +{applicant.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Accepted {timeAgo(applicant.appliedAt)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Match Score: <span className="font-semibold">{applicant.matchScore}%</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewProfile(applicant)}
                                    >
                                        View Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAccept(applicant.id)}
                                        disabled={applicant.status === 'accepted'}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onReject(applicant.id)}
                                        disabled={applicant.status === 'rejected'}
                                    >
                                        Reject
                                    </Button>
                                    {applicant.status === 'accepted' && (
                                        <span className="text-green-600 font-semibold text-xs">Accepted</span>
                                    )}
                                    {applicant.status === 'rejected' && (
                                        <span className="text-red-600 font-semibold text-xs">Rejected</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
};

export default ApplicantList;
