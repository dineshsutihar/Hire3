import React from 'react';
import { useRecoilState } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card, CardTitle } from '../components/Card';
import { listJobs, applyToJob, getJobAnalytics } from '../api/client';
import { useToast } from '../components/Toast';
import { MapPin, Briefcase, IndianRupee, Users, Clock, Search, Filter, X, ChevronRight, Building2, Bookmark } from 'lucide-react';

type Job = {
    id: string;
    title: string;
    description: string;
    companyName?: string;
    role?: string;
    industry?: string;
    salaryRange?: string;
    experienceLevel?: string;
    companyType?: string;
    skills: string[];
    location?: string;
    workMode?: string;
    tags?: string[];
    budget?: string;
    viewCount?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
};

export const FindJobs = () => {
    const [auth] = useRecoilState(authAtom);
    const { notify } = useToast();
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [nextCursor, setNextCursor] = React.useState<string | null>(null);
    const [loadingJobs, setLoadingJobs] = React.useState(false);
    const loadingRef = React.useRef(false);
    const [analytics, setAnalytics] = React.useState<Record<string, { applications: number }>>({});
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState({
        skill: '',
        location: '',
        tag: ''
    });

    // Load jobs function
    const loadJobs = React.useCallback(async (cursor?: string, append = true) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoadingJobs(true);
        try {
            // Build backend query and include search terms from active text filters
            const opts: any = {
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            };
            const searchTerms: string[] = [];
            if (search && search.trim()) searchTerms.push(search.trim());
            if (filters.skill && filters.skill.trim()) searchTerms.push(filters.skill.trim());
            if (filters.tag && filters.tag.trim()) searchTerms.push(filters.tag.trim());
            if (searchTerms.length) opts.search = searchTerms.join(' ');
            const data = await listJobs(25, cursor, opts);
            // Ensure skills and tags are always arrays
            const normalizedJobs = data.jobs.map((job: any) => ({
                ...job,
                skills: Array.isArray(job.skills)
                    ? job.skills
                    : typeof job.skills === 'string'
                        ? (() => { try { return JSON.parse(job.skills); } catch { return []; } })()
                        : [],
                tags: Array.isArray(job.tags)
                    ? job.tags
                    : typeof job.tags === 'string'
                        ? (() => { try { return JSON.parse(job.tags); } catch { return []; } })()
                        : [],
            }));
            // Client-side filtering fallback for fields not fully supported by backend
            const filteredJobs = normalizedJobs.filter((job: any) => {
                let ok = true;
                if (filters.skill && filters.skill.trim()) {
                    const needle = filters.skill.trim().toLowerCase();
                    ok = ok && (job.skills || []).some((s: string) => (s || '').toLowerCase().includes(needle));
                }
                if (filters.location && filters.location.trim()) {
                    const needle = filters.location.trim().toLowerCase();
                    ok = ok && ((job.location || '').toLowerCase().includes(needle));
                }
                if (filters.tag && filters.tag.trim()) {
                    const needle = filters.tag.trim().toLowerCase();
                    ok = ok && (job.tags || []).some((t: string) => String(t || '').toLowerCase().includes(needle));
                }
                return ok;
            });
            setJobs(j => append ? [...j, ...filteredJobs] : filteredJobs);
            setNextCursor(data.nextCursor);
        } catch (e: any) {
            notify({ type: 'error', title: 'Load failed', description: e?.message });
        } finally {
            setLoadingJobs(false);
            loadingRef.current = false;
        }
    }, [search, filters, notify]);

    // Apply to job function
    const apply = async (jobId: string) => {
        if (!auth.token) return;
        try {
            await applyToJob(auth.token, jobId);
            notify({ type: 'success', title: 'Applied!', description: 'Application submitted successfully.' });
        } catch (e: any) {
            notify({ type: 'error', title: 'Apply failed', description: e?.message || 'Could not apply to job.' });
        }
    };

    // Time helper
    const timeAgo = (iso?: string) => {
        if (!iso) return '';
        const dt = new Date(iso);
        const diffMs = Date.now() - dt.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) return `${mins || 1}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    React.useEffect(() => {
        const delayedSearch = setTimeout(() => loadJobs(undefined, false), 500);
        return () => clearTimeout(delayedSearch);
    }, [search, filters, loadJobs]);

    const handleRefresh = React.useCallback(() => {
        loadJobs(undefined, false);
    }, [loadJobs]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {selectedJob && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                                    Show Filters
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-2 w-full md:flex-1 min-w-0">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search title, company, description..."
                                className="flex-1 min-w-0 rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                            />
                            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingJobs} className="shrink-0">
                                {loadingJobs ? 'Loading...' : 'Refresh'}
                            </Button>
                        </div>
                        {/* Active filter chips */}
                        <div className="flex items-center gap-2 md:justify-end w-full md:w-auto md:flex-nowrap overflow-x-auto whitespace-nowrap">
                            {[
                                filters.skill ? { key: 'skill', label: `Skill: ${filters.skill}` } : null,
                                filters.location ? { key: 'location', label: `Location: ${filters.location}` } : null,
                                filters.tag ? { key: 'tag', label: `Tag: ${filters.tag}` } : null,
                            ].filter(Boolean).map((chip: any) => (
                                <span key={chip.key} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-xs text-primary">
                                    {chip.label}
                                </span>
                            ))}
                            {Object.values(filters).some(v => v) && (
                                <button
                                    className="text-xs text-muted-foreground hover:text-foreground underline"
                                    onClick={() => setFilters({ skill: '', location: '', tag: '' })}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Simple Filters */}
                {!selectedJob && (
                    <div className="flex flex-col gap-4 w-64">
                        <Card className="p-4 flex flex-col gap-4 max-h-[78vh] overflow-auto">
                            <CardTitle className="mb-0 text-base">Filters</CardTitle>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium">Skill</label>
                                <input
                                    value={filters.skill}
                                    onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}
                                    placeholder="e.g. React, Python"
                                    className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                />
                                <label className="text-sm font-medium">Location</label>
                                <input
                                    value={filters.location}
                                    onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                                    placeholder="e.g. Remote, New York"
                                    className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                />
                                <label className="text-sm font-medium">Tag</label>
                                <input
                                    value={filters.tag}
                                    onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
                                    placeholder="e.g. urgent, contract"
                                    className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters({ skill: '', location: '', tag: '' })}
                                    className="mt-2"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Job List */}
                <div className={`${selectedJob ? 'lg:w-[40%]' : 'flex-1'} w-full`}>
                    <Card className="h-[78vh] flex flex-col bg-white/80 dark:bg-neutral-900/80 border border-border">
                        <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
                            {jobs.length === 0 && loadingJobs && <p className="text-sm text-muted">Loading...</p>}
                            {jobs.length === 0 && !loadingJobs && <p className="text-sm text-muted">No jobs found.</p>}
                            {jobs.map(j => (
                                <div key={j.id} className={`rounded border p-3 bg-white/90 dark:bg-neutral-900/80 shadow-sm cursor-pointer transition flex flex-col gap-2 ${selectedJob?.id === j.id ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/40'}`} onClick={() => {
                                    const newSelection = j.id === selectedJob?.id ? null : j;
                                    setSelectedJob(newSelection);
                                }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-medium text-base leading-tight line-clamp-1">{j.title}</p>
                                            {j.companyName && (
                                                <p className="text-sm text-primary font-medium flex items-center gap-1">
                                                    <Building2 className="inline w-3.5 h-3.5" /> {j.companyName}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground mt-1">
                                                {j.location && <span className="flex items-center gap-1"><MapPin className="inline w-3.5 h-3.5" /> {j.location}</span>}
                                                {j.workMode && <span className="flex items-center gap-1"><Briefcase className="inline w-3.5 h-3.5" /> {j.workMode}</span>}
                                                {(j.salaryRange || j.budget) && <span className="flex items-center gap-1"><IndianRupee className="inline w-3.5 h-3.5" /> {j.salaryRange || j.budget}</span>}
                                                {j.experienceLevel && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-xs">{j.experienceLevel}</span>}
                                                <span className="text-xs text-muted/70 flex items-center gap-1"><Clock className="inline w-3.5 h-3.5" />{timeAgo(j.createdAt)}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); apply(j.id); }}>Apply</Button>
                                    </div>
                                    <p className="text-sm line-clamp-2 whitespace-pre-wrap text-foreground/70">{j.description.slice(0, 200)}</p>
                                    {j.skills && j.skills.length > 0 && <div className="flex flex-wrap gap-1">{j.skills.slice(0, 4).map((s: string, idx: number) => <span key={idx} className="text-xs rounded bg-primary/10 text-primary px-2 py-0.5">{s}</span>)}{j.skills.length > 4 && <span className="text-xs text-muted">+{j.skills.length - 4}</span>}</div>}
                                </div>
                            ))}
                            {nextCursor && (
                                <div className="h-6" ref={(el) => {
                                    if (!el) return;
                                    const obs = new IntersectionObserver(entries => {
                                        if (entries[0].isIntersecting && !loadingJobs) {
                                            loadJobs(nextCursor);
                                            obs.disconnect();
                                        }
                                    });
                                    obs.observe(el);
                                }} />
                            )}
                            {!loadingJobs && !nextCursor && jobs.length > 0 && <p className="text-center text-xs text-muted py-1">End of results</p>}
                        </div>
                    </Card>
                </div>

                {/* Job Detail Panel */}
                {selectedJob && (
                    <div className="hidden lg:flex flex-col flex-1">
                        <JobDetailPanel
                            job={selectedJob}
                            onApply={() => apply(selectedJob.id)}
                            applications={analytics[selectedJob.id]?.applications}
                            fetchAnalytics={async () => {
                                if (!auth.token) return;
                                if (analytics[selectedJob.id]) return;
                                try {
                                    const data = await getJobAnalytics(auth.token!, selectedJob.id);
                                    setAnalytics(a => ({ ...a, [selectedJob.id]: data }));
                                } catch {/* ignore */ }
                            }}
                            timeAgo={timeAgo}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Filter component
const FilterGroup: React.FC<{
    label: string;
    options: string[];
    selected?: string;
    onChange?: (value: string) => void;
}> = ({ label, options, selected = '', onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted">{label}</p>
            <div className="flex flex-wrap gap-1">
                {options.map(o => {
                    const isSelected = selected === o;
                    return (
                        <button
                            key={o}
                            type="button"
                            onClick={() => onChange?.(isSelected ? '' : o)}
                            className={`rounded-full border px-3 py-1 text-xs transition ${isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border/60 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                        >
                            {o}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Job Detail Panel
const JobDetailPanel: React.FC<{
    job: Job;
    onApply: () => void;
    applications?: number;
    fetchAnalytics: () => void | Promise<void>;
    timeAgo: (iso?: string) => string;
}> = ({ job, onApply, applications, fetchAnalytics, timeAgo }) => {
    React.useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
    return (
        <Card className="h-[78vh] flex flex-col">
            <div className="flex-1 overflow-auto p-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold leading-tight">{job.title}</h2>
                    {job.companyName && (
                        <p className="text-lg font-medium text-primary flex items-center gap-2">
                            <Building2 className="w-5 h-5" /> {job.companyName}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 items-center text-sm text-muted">
                        {job.location && <span className="flex items-center gap-1"><MapPin className="inline w-4 h-4" /> {job.location}</span>}
                        {job.workMode && <span className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded"><Briefcase className="inline w-4 h-4" /> {job.workMode}</span>}
                        <span className="flex items-center gap-1"><Clock className="inline w-4 h-4" />{timeAgo(job.createdAt)}</span>
                        {typeof applications === 'number' && <span className="flex items-center gap-1"><Users className="inline w-4 h-4" /> {applications} applicants</span>}
                    </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                    {(job.salaryRange || job.budget) && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted uppercase tracking-wide">Salary</span>
                            <span className="font-semibold">{job.salaryRange || job.budget}</span>
                        </div>
                    )}
                    {job.experienceLevel && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted uppercase tracking-wide">Experience</span>
                            <span className="font-semibold">{job.experienceLevel}</span>
                        </div>
                    )}
                    {job.companyType && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted uppercase tracking-wide">Company Type</span>
                            <span className="font-semibold">{job.companyType}</span>
                        </div>
                    )}
                    {job.industry && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted uppercase tracking-wide">Industry</span>
                            <span className="font-semibold">{job.industry}</span>
                        </div>
                    )}
                </div>

                {/* Apply Button */}
                <div className="flex gap-3">
                    <Button onClick={onApply} className="flex-1">Apply Now</Button>
                    <Button variant="outline" className="gap-2"><Bookmark className="w-4 h-4" /> Save</Button>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-3">
                    <p className="text-base font-semibold">About the Role</p>
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80">{job.description}</div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-base font-semibold">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill: string, idx: number) => (
                                <span key={idx} className="text-sm rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-base font-semibold">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag: string, idx: number) => (
                                <span key={idx} className="text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default FindJobs;
