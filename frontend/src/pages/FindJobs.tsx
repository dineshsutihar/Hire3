import React from 'react';
import { useRecoilState } from 'recoil';
import { authAtom } from '../store/auth';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { listJobs, applyToJob, getJobAnalytics } from '../api/client';
import { useToast } from '../components/Toast';
import {
    MapPin, Briefcase, Users, Clock, Search, Filter, X,
    Building2, Sparkles, TrendingUp, Zap,
    Globe, Home, Building, Heart, Share2, Eye,
    GraduationCap, Banknote, ArrowRight, RefreshCw, SlidersHorizontal
} from 'lucide-react';

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

// Skeleton loader for job cards
const JobCardSkeleton = () => (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-border/50 rounded-xl animate-pulse">
        <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-neutral-700 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2" />
                <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded-full w-20" />
                    <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded-full w-24" />
                    <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded-full w-16" />
                </div>
            </div>
        </div>
    </div>
);

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
    const [showFilters, setShowFilters] = React.useState(false);
    const [savedJobs, setSavedJobs] = React.useState<Set<string>>(new Set());
    const [filters, setFilters] = React.useState({
        skill: '',
        location: '',
        tag: '',
        workMode: '',
        experience: ''
    });

    // Load jobs function
    const loadJobs = React.useCallback(async (cursor?: string, append = true) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoadingJobs(true);
        try {
            const opts: any = {
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            };
            const searchTerms: string[] = [];
            if (search && search.trim()) searchTerms.push(search.trim());
            if (filters.skill && filters.skill.trim()) searchTerms.push(filters.skill.trim());
            if (filters.tag && filters.tag.trim()) searchTerms.push(filters.tag.trim());
            if (searchTerms.length) opts.search = searchTerms.join(' ');
            const data = await listJobs(25, cursor, opts);
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
                if (filters.workMode && filters.workMode.trim()) {
                    ok = ok && ((job.workMode || '').toLowerCase() === filters.workMode.toLowerCase());
                }
                if (filters.experience && filters.experience.trim()) {
                    ok = ok && ((job.experienceLevel || '').toLowerCase().includes(filters.experience.toLowerCase()));
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

    const apply = async (jobId: string) => {
        if (!auth.token) return;
        try {
            await applyToJob(auth.token, jobId);
            notify({ type: 'success', title: 'Applied!', description: 'Application submitted successfully.' });
        } catch (e: any) {
            notify({ type: 'error', title: 'Apply failed', description: e?.message || 'Could not apply to job.' });
        }
    };

    const toggleSaveJob = (jobId: string) => {
        setSavedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
                notify({ type: 'success', title: 'Removed', description: 'Job removed from saved' });
            } else {
                newSet.add(jobId);
                notify({ type: 'success', title: 'Saved!', description: 'Job saved for later' });
            }
            return newSet;
        });
    };

    const clearFilters = () => {
        setFilters({ skill: '', location: '', tag: '', workMode: '', experience: '' });
    };

    const activeFiltersCount = Object.values(filters).filter(v => v).length;

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

    const workModeOptions = ['Remote', 'Hybrid', 'Onsite'];
    const experienceOptions = ['Entry', 'Mid', 'Senior', 'Lead'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 border-b border-border/30">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
                <div className="relative mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    Find Your Dream Job
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    {jobs.length > 0 ? `${jobs.length} opportunities waiting for you` : 'Discover amazing opportunities'}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-800/80 rounded-xl border border-border/50 shadow-sm">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">AI-Powered Matching</span>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search job titles, companies, skills..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border/50 bg-white/90 dark:bg-neutral-800/90 text-foreground placeholder:text-muted-foreground shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="gap-2 px-4 py-3 h-auto rounded-xl border-border/50 bg-white/90 dark:bg-neutral-800/90"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 px-4 py-3 h-auto rounded-xl border-border/50 bg-white/90 dark:bg-neutral-800/90"
                                    onClick={handleRefresh}
                                    disabled={loadingJobs}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                                    {loadingJobs ? '' : 'Refresh'}
                                </Button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            {workModeOptions.map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setFilters(f => ({ ...f, workMode: f.workMode === mode ? '' : mode }))}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.workMode === mode
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'bg-white/80 dark:bg-neutral-800/80 border border-border/50 hover:border-primary/50 hover:bg-primary/5'
                                        }`}
                                >
                                    {mode === 'Remote' && <Globe className="w-3.5 h-3.5" />}
                                    {mode === 'Hybrid' && <Home className="w-3.5 h-3.5" />}
                                    {mode === 'Onsite' && <Building className="w-3.5 h-3.5" />}
                                    {mode}
                                </button>
                            ))}
                            <div className="w-px h-8 bg-border/50 mx-2 hidden md:block" />
                            {experienceOptions.map(exp => (
                                <button
                                    key={exp}
                                    onClick={() => setFilters(f => ({ ...f, experience: f.experience === exp ? '' : exp }))}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.experience === exp
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'bg-white/80 dark:bg-neutral-800/80 border border-border/50 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                >
                                    {exp}
                                </button>
                            ))}
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {filters.skill && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm">
                                        <Zap className="w-3 h-3" /> {filters.skill}
                                        <button onClick={() => setFilters(f => ({ ...f, skill: '' }))} className="ml-1 hover:text-blue-900 dark:hover:text-blue-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.location && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm">
                                        <MapPin className="w-3 h-3" /> {filters.location}
                                        <button onClick={() => setFilters(f => ({ ...f, location: '' }))} className="ml-1 hover:text-green-900 dark:hover:text-green-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.tag && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm">
                                        # {filters.tag}
                                        <button onClick={() => setFilters(f => ({ ...f, tag: '' }))} className="ml-1 hover:text-orange-900 dark:hover:text-orange-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.workMode && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm">
                                        <Briefcase className="w-3 h-3" /> {filters.workMode}
                                        <button onClick={() => setFilters(f => ({ ...f, workMode: '' }))} className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.experience && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm">
                                        <GraduationCap className="w-3 h-3" /> {filters.experience}
                                        <button onClick={() => setFilters(f => ({ ...f, experience: '' }))} className="ml-1 hover:text-purple-900 dark:hover:text-purple-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && !selectedJob && (
                        <div className="hidden md:block w-72 shrink-0">
                            <div className="sticky top-6">
                                <Card className="p-5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-border/50 shadow-lg">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Filter className="w-4 h-4" /> Advanced Filters
                                        </h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Skills</label>
                                            <input
                                                value={filters.skill}
                                                onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}
                                                placeholder="React, Python, Node.js..."
                                                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
                                            <input
                                                value={filters.location}
                                                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                                                placeholder="City, country, or remote..."
                                                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                                            <input
                                                value={filters.tag}
                                                onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
                                                placeholder="urgent, contract, startup..."
                                                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={clearFilters}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </Card>

                                {/* Job Stats Card */}
                                <Card className="p-5 mt-4 bg-gradient-to-br from-primary/5 to-purple-500/5 border-border/50">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary" /> Job Market
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Jobs</span>
                                            <span className="font-semibold">{jobs.length}+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Remote Jobs</span>
                                            <span className="font-semibold text-green-600">{jobs.filter(j => j.workMode?.toLowerCase() === 'remote').length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">New Today</span>
                                            <span className="font-semibold text-blue-600">{jobs.filter(j => {
                                                if (!j.createdAt) return false;
                                                const diff = Date.now() - new Date(j.createdAt).getTime();
                                                return diff < 24 * 60 * 60 * 1000;
                                            }).length}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Job List */}
                    <div className={`${selectedJob ? 'w-full lg:w-[45%]' : 'flex-1'}`}>
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">
                                {loadingJobs ? 'Loading...' : `Showing ${jobs.length} jobs`}
                            </p>
                            {selectedJob && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedJob(null)}
                                    className="lg:hidden"
                                >
                                    <X className="w-4 h-4 mr-1" /> Close
                                </Button>
                            )}
                        </div>

                        {/* Job Cards */}
                        <div className="space-y-3">
                            {/* Loading Skeletons */}
                            {jobs.length === 0 && loadingJobs && (
                                <>
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                </>
                            )}

                            {/* Empty State */}
                            {jobs.length === 0 && !loadingJobs && (
                                <Card className="p-12 text-center bg-white/80 dark:bg-neutral-900/80 border-border/50">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No jobs found</h3>
                                    <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                                </Card>
                            )}

                            {/* Job Cards */}
                            {jobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => setSelectedJob(job.id === selectedJob?.id ? null : job)}
                                    className={`group p-5 bg-white dark:bg-neutral-900 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${selectedJob?.id === job.id
                                            ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                                            : 'border-border/50 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Company Avatar */}
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Building2 className="w-7 h-7 text-primary" />
                                        </div>

                                        {/* Job Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                        {job.title}
                                                    </h3>
                                                    {job.companyName && (
                                                        <p className="text-primary font-medium mt-0.5">{job.companyName}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                                                        className={`p-2 rounded-lg transition-colors ${savedJobs.has(job.id)
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                                                                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                                                            }`}
                                                    >
                                                        <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {job.location && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-xs font-medium">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </span>
                                                )}
                                                {job.workMode && (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${job.workMode.toLowerCase() === 'remote'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                            : job.workMode.toLowerCase() === 'hybrid'
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                        }`}>
                                                        {job.workMode.toLowerCase() === 'remote' && <Globe className="w-3 h-3" />}
                                                        {job.workMode.toLowerCase() === 'hybrid' && <Home className="w-3 h-3" />}
                                                        {job.workMode.toLowerCase() === 'onsite' && <Building className="w-3 h-3" />}
                                                        {job.workMode}
                                                    </span>
                                                )}
                                                {(job.salaryRange || job.budget) && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                                                        <Banknote className="w-3 h-3" /> {job.salaryRange || job.budget}
                                                    </span>
                                                )}
                                                {job.experienceLevel && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                                                        <GraduationCap className="w-3 h-3" /> {job.experienceLevel}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description Preview */}
                                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                                {job.description.slice(0, 180)}...
                                            </p>

                                            {/* Skills */}
                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {job.skills.slice(0, 4).map((skill, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.skills.length > 4 && (
                                                        <span className="px-2.5 py-1 text-xs text-muted-foreground">
                                                            +{job.skills.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {timeAgo(job.createdAt)}
                                                    </span>
                                                    {job.viewCount && (
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> {job.viewCount} views
                                                        </span>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5"
                                                    onClick={(e) => { e.stopPropagation(); apply(job.id); }}
                                                >
                                                    Apply Now <ArrowRight className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Trigger */}
                            {nextCursor && (
                                <div
                                    className="h-10"
                                    ref={(el) => {
                                        if (!el) return;
                                        const obs = new IntersectionObserver(entries => {
                                            if (entries[0].isIntersecting && !loadingJobs) {
                                                loadJobs(nextCursor);
                                                obs.disconnect();
                                            }
                                        });
                                        obs.observe(el);
                                    }}
                                />
                            )}

                            {/* End Message */}
                            {!loadingJobs && !nextCursor && jobs.length > 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    ✨ You've seen all available jobs
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Job Detail Panel */}
                    {selectedJob && (
                        <div className="hidden lg:block flex-1">
                            <div className="sticky top-6">
                                <JobDetailPanel
                                    job={selectedJob}
                                    onApply={() => apply(selectedJob.id)}
                                    onSave={() => toggleSaveJob(selectedJob.id)}
                                    isSaved={savedJobs.has(selectedJob.id)}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Job Detail Panel
const JobDetailPanel: React.FC<{
    job: Job;
    onApply: () => void;
    onSave: () => void;
    isSaved: boolean;
    applications?: number;
    fetchAnalytics: () => void | Promise<void>;
    timeAgo: (iso?: string) => string;
}> = ({ job, onApply, onSave, isSaved, applications, fetchAnalytics, timeAgo }) => {
    React.useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
    return (
        <Card className="h-[calc(100vh-12rem)] flex flex-col bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="relative p-6 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 border-b border-border/30">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-tight line-clamp-2">{job.title}</h2>
                        {job.companyName && (
                            <p className="text-lg font-semibold text-primary mt-1">{job.companyName}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {job.location && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 text-sm shadow-sm">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {job.location}
                                </span>
                            )}
                            {job.workMode && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium shadow-sm ${job.workMode.toLowerCase() === 'remote'
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                        : job.workMode.toLowerCase() === 'hybrid'
                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                                    }`}>
                                    <Globe className="w-3.5 h-3.5" /> {job.workMode}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 text-sm shadow-sm">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {timeAgo(job.createdAt)}
                            </span>
                            {typeof applications === 'number' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-medium shadow-sm">
                                    <Users className="w-3.5 h-3.5" /> {applications} applicants
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {(job.salaryRange || job.budget) && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                                    <Banknote className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Salary Range</span>
                                </div>
                                <p className="font-bold text-lg">{job.salaryRange || job.budget}</p>
                            </div>
                        )}
                        {job.experienceLevel && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-800/30">
                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Experience</span>
                                </div>
                                <p className="font-bold text-lg">{job.experienceLevel}</p>
                            </div>
                        )}
                        {job.companyType && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                    <Building className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Company Type</span>
                                </div>
                                <p className="font-bold text-lg">{job.companyType}</p>
                            </div>
                        )}
                        {job.industry && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-800/30">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Industry</span>
                                </div>
                                <p className="font-bold text-lg">{job.industry}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full" />
                            About the Role
                        </h3>
                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80 bg-muted/20 rounded-xl p-4">
                            {job.description}
                        </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <span className="w-1 h-5 bg-purple-500 rounded-full" />
                                Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20 text-sm font-medium hover:shadow-md transition-shadow"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                                    >
                                        # {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border/30 bg-muted/20">
                <div className="flex gap-3">
                    <Button onClick={onApply} className="flex-1 gap-2 py-3 h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
                        <Zap className="w-5 h-5" /> Apply Now
                    </Button>
                    <Button
                        variant="outline"
                        className={`gap-2 px-6 py-3 h-auto ${isSaved ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}`}
                        onClick={onSave}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="gap-2 px-6 py-3 h-auto">
                        <Share2 className="w-5 h-5" /> Share
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default FindJobs;
