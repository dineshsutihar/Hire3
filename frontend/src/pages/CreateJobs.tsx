import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { SkillInput } from '../components/SkillInput';
import { createJob } from '../api/client';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { ensurePlatformFeePaid } from '../web3/solana';
import { verifyPayment, getPaymentRequirements } from '../api/client';
import { Briefcase, MapPin, DollarSign, Tags, FileText, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

export const CreateJobs = () => {
    const auth = useRecoilValue(authAtom);
    const { notify } = useToast();
    const navigate = useNavigate();
    const [posting, setPosting] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(1);
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        skills: [] as string[],
        budget: '',
        location: '',
        workMode: '',
        tags: ''
    });

    const steps = [
        { number: 1, title: 'Job Details', icon: Briefcase },
        { number: 2, title: 'Requirements', icon: FileText },
        { number: 3, title: 'Payment', icon: Wallet },
    ];

    const isStep1Valid = form.title.trim() && form.location.trim() && form.workMode;
    const isStep2Valid = form.description.trim() && form.skills.length > 0 && form.budget.trim();
    const canPost = isStep1Valid && isStep2Valid;

    const postJob = async () => {
        if (!auth.token) return;
        if (!canPost) {
            notify({ type: 'error', title: 'Missing fields', description: 'Please fill in all required fields.' });
            return;
        }
        setPosting(true);
        try {
            // 1) Require Solana platform fee payment before posting
            try {
                const { requiredLamports } = await getPaymentRequirements();
                const { signature } = await ensurePlatformFeePaid(requiredLamports);
                await verifyPayment(auth.token, { signature });
                console.log('Platform fee paid and verified. Tx:', signature);
            } catch (e: any) {
                throw new Error(e?.message || 'Payment verification failed.');
            }

            const job = await createJob(auth.token, {
                title: form.title.trim(),
                description: form.description.trim(),
                skills: form.skills,
                budget: form.budget,
                location: form.location.trim(),
                workMode: form.workMode.trim(),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            notify({ type: 'success', title: 'Job posted!', description: `${job.title} has been posted successfully.` });
            setForm({ title: '', description: '', skills: [], budget: '', location: '', workMode: '', tags: '' });
            navigate('/dashboard');
        } catch (e: any) {
            notify({ type: 'error', title: 'Post failed', description: e?.message || 'Could not post job.' });
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <button
                                onClick={() => setCurrentStep(step.number)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentStep === step.number
                                        ? 'bg-primary text-white'
                                        : currentStep > step.number
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-muted/10 text-muted'
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep === step.number
                                        ? 'bg-white/20'
                                        : currentStep > step.number
                                            ? 'bg-green-500/20'
                                            : 'bg-muted/20'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <step.icon size={18} />
                                    )}
                                </div>
                                <span className="hidden sm:inline font-medium">{step.title}</span>
                            </button>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-0.5 ${currentStep > step.number ? 'bg-green-500' : 'bg-border'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <Card className="p-8">
                {/* Step 1: Job Details */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Job Details</h2>
                            <p className="text-sm text-muted">Basic information about the position</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g., Senior Frontend Developer"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            value={form.location}
                                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                            placeholder="e.g., Remote, New York, London"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Work Mode <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.workMode}
                                        onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    >
                                        <option value="">Select work mode</option>
                                        <option value="Remote">🌍 Remote</option>
                                        <option value="Onsite">🏢 Onsite</option>
                                        <option value="Hybrid">🔄 Hybrid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={() => setCurrentStep(2)}
                                disabled={!isStep1Valid}
                                className="gap-2"
                            >
                                Continue to Requirements
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Requirements */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Requirements & Details</h2>
                            <p className="text-sm text-muted">Describe what you're looking for</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe the role, responsibilities, qualifications, and what makes this opportunity exciting..."
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted resize-y focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                                <p className="text-xs text-muted mt-1">{form.description.length} characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Required Skills <span className="text-red-500">*</span>
                                </label>
                                <SkillInput
                                    value={form.skills}
                                    onChange={(skills) => setForm(f => ({ ...f, skills }))}
                                />
                                <p className="text-xs text-muted mt-1">Press Enter or comma to add skills</p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Budget / Salary <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            value={form.budget}
                                            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                                            placeholder="e.g., $80k-120k, ₹10-15 LPA"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                                    <div className="relative">
                                        <Tags size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            value={form.tags}
                                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                            placeholder="e.g., urgent, contract, visa-sponsor"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button
                                onClick={() => setCurrentStep(3)}
                                disabled={!isStep2Valid}
                                className="gap-2"
                            >
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Payment */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Review & Publish</h2>
                            <p className="text-sm text-muted">Confirm details and pay to publish</p>
                        </div>

                        {/* Job Preview */}
                        <div className="border border-border rounded-xl p-6 bg-muted/5">
                            <h3 className="font-semibold text-lg mb-4">Job Preview</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold">{form.title || 'Job Title'}</h4>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {form.location || 'Location'}</span>
                                        <span className="flex items-center gap-1"><Briefcase size={14} /> {form.workMode || 'Work Mode'}</span>
                                        <span className="flex items-center gap-1"><DollarSign size={14} /> {form.budget || 'Budget'}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Description</p>
                                    <p className="text-sm text-muted line-clamp-3">{form.description || 'No description provided'}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {form.skills.length > 0 ? form.skills.map((s, i) => (
                                            <span key={i} className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">{s}</span>
                                        )) : (
                                            <span className="text-xs text-muted">No skills added</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border border-primary/30 rounded-xl p-6 bg-primary/5">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                    <Wallet size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Platform Fee Required</h3>
                                    <p className="text-sm text-muted mt-1">
                                        A small SOL fee is required to publish your job. This helps prevent spam and ensures quality listings.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-2xl font-bold text-primary">0.01 SOL</span>
                                        <span className="text-xs text-muted">(~$2 USD)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Validation Checklist */}
                        <div className="space-y-2">
                            {[
                                { label: 'Job title provided', valid: !!form.title.trim() },
                                { label: 'Location specified', valid: !!form.location.trim() },
                                { label: 'Work mode selected', valid: !!form.workMode },
                                { label: 'Description added', valid: !!form.description.trim() },
                                { label: 'At least one skill added', valid: form.skills.length > 0 },
                                { label: 'Budget/salary specified', valid: !!form.budget.trim() },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    {item.valid ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={16} className="text-red-500" />
                                    )}
                                    <span className={item.valid ? 'text-muted' : 'text-red-500'}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                Back to Edit
                            </Button>
                            <Button onClick={postJob} disabled={posting || !canPost} className="gap-2">
                                <Wallet size={18} />
                                {posting ? 'Publishing...' : 'Pay & Publish Job'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CreateJobs;
