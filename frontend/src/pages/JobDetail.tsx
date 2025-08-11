import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import { applyToJob } from '../api/client';
import Button from '../components/Button';
import { Card, CardTitle, CardDescription } from '../components/Card';
import { useToast } from '../components/Toast';

interface JobFull {
    id: string; title: string; description: string; companyName: string; requirements: string[]; createdAt?: string; applicationStatus?: string | null; matchScore?: number | null;
}

export const JobDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notify } = useToast();
    const auth = useRecoilValue(authAtom);
    const [job, setJob] = React.useState<JobFull | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [applying, setApplying] = React.useState(false);
    const base = import.meta.env.VITE_API_BASE;

    React.useEffect(() => {
        (async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`${base}/jobs/${id}`, { headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined });
                if (res.ok) {
                    const data = await res.json();
                    setJob(data);
                } else {
                    notify({ type: 'error', title: 'Not found', description: 'Job not found.' });
                }
            } catch (e: any) {
                notify({ type: 'error', title: 'Error', description: e?.message || 'Failed to load job.' });
            } finally { setLoading(false); }
        })();
    }, [id, auth.token]);

    const apply = async () => {
        if (!auth.token || !id) { notify({ type: 'error', title: 'Auth required', description: 'Login to apply.' }); return; }
        setApplying(true);
        try {
            await applyToJob(auth.token, id);
            notify({ type: 'success', title: 'Applied', description: 'Application submitted.' });
            setJob(j => j ? { ...j, applicationStatus: 'PENDING' } : j);
        } catch (e: any) {
            notify({ type: 'error', title: 'Apply failed', description: e?.message || 'Could not apply.' });
        } finally { setApplying(false); }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!job) return <div className="p-6">No job.</div>;

    const sections = job.description.split(/\n\n+/g);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← Back</Button>
            <Card className="space-y-6">
                <div className="flex flex-col gap-1">
                    <CardTitle className="mb-0">{job.title}</CardTitle>
                    <CardDescription className="text-sm">{job.companyName}</CardDescription>
                    {job.matchScore != null && <p className="text-xs text-primary">Match Score: {(job.matchScore * 100).toFixed(0)}%</p>}
                    {job.applicationStatus && <p className="text-xs">Status: {job.applicationStatus}</p>}
                </div>
                <div className="flex flex-col gap-5">
                    {sections.map((s, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{s}</p>
                        </div>
                    ))}
                </div>
                {job.requirements?.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">Requirements</p>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.map(r => <span key={r} className="text-[11px] rounded bg-primary/10 text-primary px-2 py-1">{r}</span>)}
                        </div>
                    </div>
                )}
                <div className="pt-2">
                    <Button disabled={applying || job.applicationStatus === 'PENDING'} onClick={apply}>{applying ? 'Applying...' : job.applicationStatus ? 'Already Applied' : 'Apply'}</Button>
                </div>
            </Card>
        </div>
    );
};

export default JobDetail;
