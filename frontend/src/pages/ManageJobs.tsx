import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { PageLoading, SkeletonCard } from '../components/LoadingSpinner';
import { EmptyState } from '../components/ErrorBoundary';
import { useToast } from '../components/Toast';
import { getUserJobs, getJobApplicants, getJobAnalytics, updateJob } from '../api/client';
import { updateApplicantStatus as updateApplicantStatusAPI } from '../api/client';
import JobStats from '../components/managejobs/JobStats';
import ApplicantList from '../components/managejobs/ApplicantList';
import ProfileModal from '../components/managejobs/ProfileModal';
import JobCard from '../components/managejobs/JobCard';
import { ArrowLeft, Briefcase, Plus, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface JobPosting {
    id: string;
    title: string;
    createdAt: string;
    status: string;
    applicantCount: number;
    viewCount: number;
    location?: string;
    workMode?: string;
    budget?: string;
    skills?: string[];
}

interface Applicant {
    id: string;
    jobId: string;
    userId: string;
    name: string;
    email: string;
    appliedAt: string;
    status: 'applied' | 'rejected' | 'accepted';
    skills: string[];
    experience?: string;
    matchScore?: number;
}

const ManageJobs: React.FC = () => {
    const auth = useRecoilValue(authAtom);
    const { notify } = useToast();

    const [jobs, setJobs] = React.useState<JobPosting[]>([]);
    const [profileModal, setProfileModal] = React.useState<{ open: boolean; applicant: Applicant | null }>({ open: false, applicant: null });
    const [totalApplications, setTotalApplications] = React.useState(0);
    const [selectedJob, setSelectedJob] = React.useState<JobPosting | null>(null);
    const [applicants, setApplicants] = React.useState<Applicant[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [applicantsLoading, setApplicantsLoading] = React.useState(false);
    const [applicantFilter, setApplicantFilter] = React.useState<'all' | 'accepted' | 'rejected'>('all');

    // Load jobs from backend
    React.useEffect(() => {
        const fetchJobs = async () => {
            if (!auth.token) return;
            setLoading(true);
            try {
                const response = await getUserJobs(auth.token);
                const formattedJobs: JobPosting[] = response.jobs.map(job => ({
                    id: job.id,
                    title: job.title,
                    createdAt: job.createdAt || new Date().toISOString(),
                    status: job.status || 'active',
                    applicantCount: 0,
                    viewCount: 0,
                    location: job.location || 'Not specified',
                    workMode: job.workMode || 'Not specified',
                    budget: job.budget || 'Not specified',
                    skills: job.skills || [],
                }));
                setJobs(formattedJobs);
                // Fetch total applications for all jobs
                let total = 0;
                await Promise.all(formattedJobs.map(async (job) => {
                    try {
                        if (!job.id || typeof job.id !== 'string' || !auth.token) return;
                        const res = await getJobApplicants(auth.token, job.id);
                        total += res.applicants.length;
                    } catch { }
                }));
                setTotalApplications(total);
            } catch (error: any) {
                console.error('Failed to fetch jobs:', error);
                notify({
                    type: 'error',
                    title: 'Error',
                    description: 'Failed to load your jobs'
                });
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [auth.token, notify]);

    // Load applicants for selected job from backend
    React.useEffect(() => {
        const fetchApplicants = async () => {
            if (!selectedJob || !auth.token) return;

            setApplicantsLoading(true);
            try {
                const response = await getJobApplicants(auth.token, selectedJob.id);
                // Calculate match score (simple overlap of skills)
                const jobSkills = (selectedJob.skills || []).map((s: string) => s.toLowerCase());
                const formattedApplicants: Applicant[] = response.applicants.map(app => {
                    const userSkills = Array.isArray((app.user as any).skills) ? (app.user as any).skills : [];
                    const applicantSkills = userSkills.map((s: string) => s.toLowerCase());
                    const overlap = jobSkills.filter(s => applicantSkills.includes(s));
                    const matchScore = jobSkills.length > 0 ? Math.round((overlap.length / jobSkills.length) * 100) : 0;
                    return {
                        id: app.id,
                        jobId: selectedJob.id,
                        userId: app.userId,
                        name: app.user.name,
                        email: app.user.email,
                        appliedAt: app.createdAt,
                        status: (app.status as Applicant['status']) || 'applied',
                        skills: userSkills,
                        experience: 'Not specified',
                        matchScore,
                    };
                });
                setApplicants(formattedApplicants);
            } catch (error: any) {
                console.error('Failed to fetch applicants:', error);
                notify({
                    type: 'error',
                    title: 'Error',
                    description: 'Failed to load applicants'
                });
                setApplicants([]); // Show empty state when error occurs
            } finally {
                setApplicantsLoading(false);
            }
        };

        if (selectedJob) {
            fetchApplicants();
        }
    }, [selectedJob, auth.token, notify]);

    const filteredApplicants = applicants.filter(applicant =>
        applicantFilter === 'all' || applicant.status === applicantFilter
    );

    // Update applicant status and persist to backend
    const updateApplicantStatus = async (applicantId: string, newStatus: Applicant['status']) => {
        if (!selectedJob || !auth.token) return;
        // Optimistic update
        setApplicants(prev => prev.map(app =>
            app.id === applicantId ? { ...app, status: newStatus } : app
        ));
        try {
            await updateApplicantStatusAPI(auth.token, selectedJob.id, applicantId, newStatus);
            notify({
                type: 'success',
                title: 'Status Updated',
                description: `Applicant status changed to ${newStatus}`
            });
        } catch (e: any) {
            notify({
                type: 'error',
                title: 'Update Failed',
                description: e?.message || 'Could not update status.'
            });
            setApplicants(prev => prev.map(app =>
                app.id === applicantId ? { ...app, status: app.status } : app
            ));
        }
    };

    // Modular close job handler
    const closeJob = async (job: JobPosting) => {
        if (!auth.token) return;
        try {
            await updateJob(auth.token, job.id, { status: 'closed' } as any);
            setJobs(jobs => jobs.map(j => j.id === job.id ? { ...j, status: 'closed' } : j));
            notify({ type: 'success', title: 'Job Closed', description: 'This job has been closed.' });
        } catch (e: any) {
            notify({ type: 'error', title: 'Close Failed', description: e?.message || 'Could not close job.' });
        }
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
            case 'closed': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
            case 'applied': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
            case 'rejected': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
            default: return 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300';
        }
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        return `${diffDays} days ago`;
    };

    if (selectedJob) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedJob(null)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Jobs
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{selectedJob.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {selectedJob.location && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {selectedJob.location}
                                    </span>
                                )}
                                {selectedJob.workMode && (
                                    <span>• {selectedJob.workMode}</span>
                                )}
                                {selectedJob.budget && (
                                    <span>• {selectedJob.budget}</span>
                                )}
                            </div>
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${selectedJob.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${selectedJob.status === 'active' ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                                }`} />
                            {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                        </div>
                    </div>
                </div>

                {/* Applicant Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{applicants.length}</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'applied').length}</div>
                                <div className="text-xs text-muted-foreground">Pending</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'accepted').length}</div>
                                <div className="text-xs text-muted-foreground">Accepted</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'rejected').length}</div>
                                <div className="text-xs text-muted-foreground">Rejected</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <ApplicantList
                    applicants={applicants}
                    applicantsLoading={applicantsLoading}
                    applicantFilter={applicantFilter as string}
                    setApplicantFilter={setApplicantFilter as unknown as (filter: string) => void}
                    getStatusColor={getStatusColor}
                    timeAgo={timeAgo}
                    onViewProfile={applicant => setProfileModal({ open: true, applicant })}
                    onAccept={id => updateApplicantStatus(id, 'accepted')}
                    onReject={id => updateApplicantStatus(id, 'rejected')}
                />

                <ProfileModal
                    open={profileModal.open}
                    applicant={profileModal.applicant}
                    onClose={() => setProfileModal({ open: false, applicant: null })}
                    getStatusColor={getStatusColor}
                    onAccept={id => updateApplicantStatus(id, 'accepted')}
                    onReject={id => updateApplicantStatus(id, 'rejected')}
                />
            </div>
        );
    }



    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Manage Jobs</h1>
                    <p className="text-muted-foreground">Track your job postings and review applicants</p>
                </div>
                <Button onClick={() => window.location.href = '/dashboard'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                </Button>
            </div>

            <JobStats jobs={jobs} totalApplications={totalApplications} />

            {/* Jobs List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Your Job Postings
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} total
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <SkeletonCard key={i} className="h-48" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={<Briefcase className="h-12 w-12" />}
                        title="No jobs posted yet"
                        description="Create your first job posting to start finding talented candidates for your team."
                        action={{
                            label: "Post Your First Job",
                            onClick: () => window.location.href = '/dashboard'
                        }}
                    />
                ) : (
                    jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onViewApplicants={setSelectedJob}
                            onCloseJob={closeJob}
                            getStatusColor={getStatusColor}
                            timeAgo={timeAgo}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageJobs;