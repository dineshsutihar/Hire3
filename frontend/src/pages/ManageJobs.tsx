import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { getUserJobs, getJobApplicants, getJobAnalytics, updateJob } from '../api/client';
import { updateApplicantStatus as updateApplicantStatusAPI } from '../api/client';
import JobStats from '../components/managejobs/JobStats';
import ApplicantList from '../components/managejobs/ApplicantList';
import ProfileModal from '../components/managejobs/ProfileModal';
import JobCard from '../components/managejobs/JobCard';

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
            case 'active': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-red-100 text-red-800';
            case 'applied': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setSelectedJob(null)}>
                            ← Back to Jobs
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">{selectedJob.title}</h1>
                        </div>
                    </div>
                </div>
                {/* Applicant Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{applicants.length}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{applicants.filter(a => a.status === 'accepted').length}</div>
                        <div className="text-sm text-muted-foreground">Accepted</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{applicants.filter(a => a.status === 'rejected').length}</div>
                        <div className="text-sm text-muted-foreground">Rejected</div>
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
                />
            </div>
        );
    }



    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <JobStats jobs={jobs} totalApplications={totalApplications} />
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                        <span className="ml-2 text-muted-foreground">Loading your jobs...</span>
                    </div>
                ) : jobs.length === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="text-muted-foreground mb-4">
                            You haven't posted any jobs yet.
                        </div>
                        <Button onClick={() => window.location.href = '/create-jobs'}>
                            Post Your First Job
                        </Button>
                    </Card>
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