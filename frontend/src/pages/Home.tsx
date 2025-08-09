import { Link } from 'react-router-dom';
import Button from '../components/Button';
import React from 'react';

interface TalentCardProps { name: string; role: string; skills: string[]; }
const TalentCard: React.FC<TalentCardProps> = ({ name, role, skills }) => (
    <div className="card-surface p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{name[0]}</div>
            <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted">{role}</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
            {skills.map(s => <span key={s} className="rounded-md bg-muted/10 px-2 py-1 border border-border/50 dark:border-border/30">{s}</span>)}
        </div>
    </div>
);

interface JobSnippetProps { title: string; company: string; tags: string[]; }
const JobSnippet: React.FC<JobSnippetProps> = ({ title, company, tags }) => (
    <div className="card-surface p-4 space-y-2">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted">{company}</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
            {tags.map(t => <span key={t} className="rounded bg-primary/10 text-primary px-2 py-1">{t}</span>)}
        </div>
    </div>
);

const talents: TalentCardProps[] = [
    { name: 'Alice Kim', role: 'Solidity Engineer', skills: ['Solidity', 'Hardhat', 'DeFi'] },
    { name: 'Marcus Lee', role: 'Fullstack Dev', skills: ['React', 'Node', 'Postgres'] },
    { name: 'Sara Novak', role: 'Product Designer', skills: ['Figma', 'UX', 'Design Systems'] },
];
const jobs: JobSnippetProps[] = [
    { title: 'Senior Smart Contract Engineer', company: 'ChainLabs', tags: ['Solidity', 'Security', 'Full-time'] },
    { title: 'Frontend Lead (Web3)', company: 'OpenGuild', tags: ['React', 'TypeScript', 'Remote'] },
    { title: 'Product Designer (dApps)', company: 'BlockForge', tags: ['Design', 'UI/UX'] },
];

export const Home = () => {
    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/5 to-background pt-20 pb-24 text-center overflow-hidden">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
                <div className="app-container relative z-10 flex flex-col gap-8">
                    <h1
                        className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight drop-shadow-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent dark:text-transparent text-gray-900"
                        style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
                    >
                        The professional network for builders & teams
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted text-xl md:text-2xl font-medium">
                        Showcase your skills, discover high-signal opportunities, and collaborate faster. Hire3 connects talent and teams in one focused workspace.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                        <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg"><Link to="/register">Create your profile</Link></Button>
                        <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold"><Link to="/login">Sign in</Link></Button>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="app-container py-10">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How Hire3 Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-surface p-8 flex flex-col items-center gap-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">1</span>
                        <h3 className="font-semibold text-lg">Showcase Skills</h3>
                        <p className="text-sm text-muted text-center">Upload your resume, add your stack, and highlight your best work. Verified skills boost your credibility.</p>
                    </div>
                    <div className="card-surface p-8 flex flex-col items-center gap-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">2</span>
                        <h3 className="font-semibold text-lg">Discover Curated Jobs</h3>
                        <p className="text-sm text-muted text-center">Browse high-quality roles from top teams. Filter by stack, compensation, and remote options.</p>
                    </div>
                    <div className="card-surface p-8 flex flex-col items-center gap-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">3</span>
                        <h3 className="font-semibold text-lg">Connect & Collaborate</h3>
                        <p className="text-sm text-muted text-center">Message founders, engineers, and designers directly. Form agile squads and start building together.</p>
                    </div>
                </div>
            </section>

            {/* Demo Content: Talent & Jobs Preview */}
            <section className="bg-gradient-to-b from-background to-primary/5 py-16">
                <div className="app-container grid gap-14 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Featured Talent</h2>
                            <Link to="/register" className="text-sm text-primary hover:underline">Join →</Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {talents.map(t => <TalentCard key={t.name} {...t} />)}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Latest Opportunities</h2>
                            <Link to="/dashboard" className="text-sm text-primary hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-4">
                            {jobs.map(j => <JobSnippet key={j.title} {...j} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Hire3 Section */}
            <section className="app-container py-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why Hire3?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-surface p-8 flex flex-col gap-4 items-center">
                        <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" stroke="#6366F1" strokeWidth="3" fill="#EEF2FF" /><path d="M12 18l4 4 8-8" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <h3 className="font-semibold text-lg">Signal Credibility</h3>
                        <p className="text-sm text-muted text-center">Verified skills, on-chain work, and endorsements help you stand out to top teams.</p>
                    </div>
                    <div className="card-surface p-8 flex flex-col gap-4 items-center">
                        <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="6" y="6" width="24" height="24" rx="6" fill="#F1F5F9" stroke="#6366F1" strokeWidth="3" /><path d="M12 18h12" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" /></svg>
                        <h3 className="font-semibold text-lg">Curated Roles</h3>
                        <p className="text-sm text-muted text-center">No spam. Only high-signal jobs from teams building the future of tech.</p>
                    </div>
                    <div className="card-surface p-8 flex flex-col gap-4 items-center">
                        <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#F1F5F9" stroke="#6366F1" strokeWidth="3" /><path d="M18 12v12M12 18h12" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" /></svg>
                        <h3 className="font-semibold text-lg">Faster Collaboration</h3>
                        <p className="text-sm text-muted text-center">Connect directly with founders, engineers, and designers. No middlemen.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-primary/90 py-16 text-center rounded-xl mx-2 md:mx-auto max-w-5xl shadow-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Ready to build your network?</h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 text-gray-800 dark:text-white">Create a profile in minutes and start connecting with high-signal builders and teams.</p>
                <Button asChild size="lg" className="px-10 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100 shadow-lg"><Link to="/register">Get Started</Link></Button>
            </section>
        </div>
    );
};

export default Home;
