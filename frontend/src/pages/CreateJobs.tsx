import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { SkillInput } from '../components/SkillInput';
import { createJob } from '../api/client';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const CreateJobs = () => {
    const auth = useRecoilValue(authAtom);
    const { notify } = useToast();
    const navigate = useNavigate();
    const [posting, setPosting] = React.useState(false);
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        skills: [] as string[],
        budget: '',
        location: '',
        tags: ''
    });

    const postJob = async () => {
        if (!auth.token) return;
        if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.budget.trim() || form.skills.length === 0) {
            notify({ type: 'error', title: 'Missing fields', description: 'Please fill in all required fields.' });
            return;
        }
        setPosting(true);
        try {
            const job = await createJob(auth.token, {
                title: form.title.trim(),
                description: form.description.trim(),
                technicalSkills: form.skills,
                salaryRange: form.budget,
                location: form.location.trim(),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            notify({ type: 'success', title: 'Job posted!', description: `${job.title} has been posted successfully.` });
            setForm({ title: '', description: '', skills: [], budget: '', location: '', tags: '' });
            navigate('/manage-jobs');
        } catch (e: any) {
            notify({ type: 'error', title: 'Post failed', description: e?.message || 'Could not post job.' });
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <Card className="p-6">
                <div className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold border-b border-border/30 pb-2">Job Details</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Job Title *</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g., Senior Frontend Developer"
                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Location *</label>
                                <input
                                    value={form.location}
                                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    placeholder="e.g., Remote, New York"
                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Job Description *</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                rows={6}
                                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted resize-y"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Skills (comma separated) *</label>
                            <SkillInput
                                value={form.skills}
                                onChange={(skills) => setForm(f => ({ ...f, skills }))}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Budget / Salary *</label>
                                <input
                                    value={form.budget}
                                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                                    placeholder="e.g., 100000 or 80k-120k INR"
                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                                <input
                                    value={form.tags}
                                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="e.g., remote, urgent, contract"
                                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/30">
                        <Button variant="outline" onClick={() => navigate('/find-jobs')}>
                            Cancel
                        </Button>
                        <Button onClick={postJob} disabled={posting}>
                            {posting ? 'Publishing...' : 'Publish Job'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CreateJobs;
