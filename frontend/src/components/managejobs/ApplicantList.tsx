import React from 'react';
import Button from '../Button';
import { Card } from '../Card';
import { PageLoading, SkeletonCard } from '../LoadingSpinner';
import { EmptyState } from '../ErrorBoundary';
import {
    User,
    Mail,
    Calendar,
    Star,
    CheckCircle,
    XCircle,
    UserCheck,
    UserX,
    Filter,
    Search,
    SortAsc
} from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortBy, setSortBy] = React.useState<'date' | 'score'>('date');

    const applicantCounts = applicants.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Filter and sort applicants
    const filteredApplicants = applicants
        .filter(app => {
            const matchesFilter = applicantFilter === 'all' || app.status === applicantFilter;
            const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'score') return (b.matchScore || 0) - (a.matchScore || 0);
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        });

    const filterTabs = [
        { key: 'all', label: 'All', count: applicants.length, icon: User },
        { key: 'applied', label: 'Pending', count: applicantCounts.applied || 0, icon: Calendar },
        { key: 'accepted', label: 'Accepted', count: applicantCounts.accepted || 0, icon: UserCheck },
        { key: 'rejected', label: 'Rejected', count: applicantCounts.rejected || 0, icon: UserX }
    ];

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <SortAsc className="h-4 w-4" />
                        Sort:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                        className="px-3 py-2 border rounded-lg bg-background text-sm"
                    >
                        <option value="date">Most Recent</option>
                        <option value="score">Match Score</option>
                    </select>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {filterTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setApplicantFilter(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${applicantFilter === tab.key
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${applicantFilter === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 dark:bg-neutral-700'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Applicants List */}
            <div className="space-y-4">
                {applicantsLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <SkeletonCard key={i} className="h-40" />
                        ))}
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <EmptyState
                        icon={<User className="h-12 w-12" />}
                        title={searchTerm ? "No matches found" : "No applicants yet"}
                        description={
                            searchTerm
                                ? `No applicants match "${searchTerm}". Try a different search.`
                                : applicantFilter === 'all'
                                    ? "No one has applied to this job yet. Share it to attract candidates!"
                                    : `No applicants with "${applicantFilter}" status.`
                        }
                        action={searchTerm ? (
                            <Button variant="outline" onClick={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                        ) : undefined}
                    />
                ) : (
                    filteredApplicants.map(applicant => (
                        <Card key={applicant.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                {/* Left side - Avatar and basic info */}
                                <div className="p-6 flex-1">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md">
                                            {applicant.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-lg font-semibold">{applicant.name}</h3>

                                                {/* Status Badge */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${applicant.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        applicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {applicant.status === 'accepted' && <CheckCircle className="h-3 w-3" />}
                                                    {applicant.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                                </span>

                                                {/* Match Score */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(applicant.matchScore || 0)}`}>
                                                    <Star className="h-3 w-3" />
                                                    {applicant.matchScore || 0}% match
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                                <Mail className="h-3.5 w-3.5" />
                                                {applicant.email}
                                            </p>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {applicant.skills.slice(0, 6).map((skill: string) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {applicant.skills.length > 6 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        +{applicant.skills.length - 6}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Applied {timeAgo(applicant.appliedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Actions */}
                                <div className="flex md:flex-col items-center justify-end gap-2 p-4 bg-gray-50 dark:bg-neutral-800/50 border-t md:border-t-0 md:border-l">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewProfile(applicant)}
                                        className="w-full md:w-auto"
                                    >
                                        <User className="h-4 w-4 mr-1" />
                                        Profile
                                    </Button>

                                    {applicant.status !== 'accepted' && (
                                        <Button
                                            size="sm"
                                            onClick={() => onAccept(applicant.id)}
                                            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Accept
                                        </Button>
                                    )}

                                    {applicant.status !== 'rejected' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onReject(applicant.id)}
                                            className="w-full md:w-auto text-red-600 hover:bg-red-50 border-red-200"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Results count */}
            {!applicantsLoading && filteredApplicants.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                    Showing {filteredApplicants.length} of {applicants.length} applicants
                </p>
            )}
        </div>
    );
};

export default ApplicantList;
