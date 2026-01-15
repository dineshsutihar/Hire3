import { Link } from 'react-router-dom';
import Button from '../components/Button';
import React from 'react';
import { Briefcase, Users, Shield, Zap, CheckCircle, ArrowRight, Star, Globe, TrendingUp } from 'lucide-react';

interface TalentCardProps { name: string; role: string; skills: string[]; rating?: number; }
const TalentCard: React.FC<TalentCardProps> = ({ name, role, skills, rating = 4.9 }) => (
    <div className="card-surface p-5 flex flex-col gap-3 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
        <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary flex items-center justify-center text-base font-bold border border-primary/20">
                {name[0]}
            </div>
            <div className="flex-1">
                <p className="font-semibold group-hover:text-primary transition-colors">{name}</p>
                <p className="text-xs text-muted">{role}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-medium">{rating}</span>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
            {skills.map(s => <span key={s} className="rounded-full bg-muted/10 px-2.5 py-1 border border-border/50 dark:border-border/30">{s}</span>)}
        </div>
    </div>
);

interface JobSnippetProps { title: string; company: string; tags: string[]; salary?: string; location?: string; }
const JobSnippet: React.FC<JobSnippetProps> = ({ title, company, tags, salary = "$120k-180k", location = "Remote" }) => (
    <div className="card-surface p-5 space-y-3 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-semibold group-hover:text-primary transition-colors">{title}</p>
                <p className="text-sm text-muted">{company}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary">
                <Briefcase size={18} />
            </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Globe size={12} /> {location}</span>
            <span className="text-primary font-medium">{salary}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
            {tags.map(t => <span key={t} className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">{t}</span>)}
        </div>
    </div>
);

interface StatCardProps { value: string; label: string; icon: React.ReactNode; }
const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => (
    <div className="text-center p-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            {icon}
        </div>
        <p className="text-3xl md:text-4xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted mt-1">{label}</p>
    </div>
);

const talents: TalentCardProps[] = [
    { name: 'Alice Kim', role: 'Solidity Engineer', skills: ['Solidity', 'Hardhat', 'DeFi'], rating: 4.9 },
    { name: 'Marcus Lee', role: 'Fullstack Dev', skills: ['React', 'Node', 'Postgres'], rating: 4.8 },
    { name: 'Sara Novak', role: 'Product Designer', skills: ['Figma', 'UX', 'Design Systems'], rating: 5.0 },
    { name: 'James Chen', role: 'DevOps Engineer', skills: ['AWS', 'Docker', 'K8s'], rating: 4.7 },
];
const jobs: JobSnippetProps[] = [
    { title: 'Senior Smart Contract Engineer', company: 'ChainLabs', tags: ['Solidity', 'Security'], salary: '$150k-200k', location: 'Remote' },
    { title: 'Frontend Lead (Web3)', company: 'OpenGuild', tags: ['React', 'TypeScript'], salary: '$130k-170k', location: 'Remote' },
    { title: 'Product Designer (dApps)', company: 'BlockForge', tags: ['Design', 'UI/UX'], salary: '$100k-140k', location: 'Hybrid' },
    { title: 'Backend Engineer', company: 'CryptoVerse', tags: ['Node.js', 'PostgreSQL'], salary: '$120k-160k', location: 'On-site' },
];

const testimonials = [
    { name: 'Sarah Johnson', role: 'CTO at TechStart', quote: 'Hire3 helped us find exceptional blockchain talent in just 2 weeks. The quality of candidates is unmatched.', avatar: 'S' },
    { name: 'Michael Chen', role: 'Founder at DeFi Labs', quote: 'The Web3-native approach makes all the difference. Finally a platform that understands our hiring needs.', avatar: 'M' },
    { name: 'Emily Rodriguez', role: 'Engineering Lead', quote: 'I found my dream job through Hire3. The skill matching is incredibly accurate.', avatar: 'E' },
];

export const Home = () => {
    return (
        <div className="space-y-0 pb-0">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/5 via-background to-background pt-16 pb-20 text-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute top-60 left-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

                <div className="app-container relative z-10 flex flex-col gap-6">
                    {/* Badge */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                            <Zap size={14} />
                            <span>Web3-Native Talent Platform</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
                        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                            Find Top Talent.
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Build The Future.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-muted text-lg md:text-xl leading-relaxed">
                        Connect with verified professionals, discover curated opportunities, and collaborate seamlessly.
                        Hire3 is where builders and teams find each other.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                        <Button asChild size="lg" className="px-8 py-5 text-base font-semibold shadow-lg shadow-primary/20 gap-2">
                            <Link to="/register">
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="px-8 py-5 text-base font-semibold">
                            <Link to="/login">Sign in to Dashboard</Link>
                        </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-muted">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle size={16} className="text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Shield size={16} className="text-blue-500" />
                            <span>SOC 2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Zap size={16} className="text-amber-500" />
                            <span>5 minute setup</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y border-border/60 bg-muted/5">
                <div className="app-container py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard value="10,000+" label="Active Professionals" icon={<Users size={24} />} />
                        <StatCard value="2,500+" label="Companies Hiring" icon={<Briefcase size={24} />} />
                        <StatCard value="95%" label="Match Success Rate" icon={<TrendingUp size={24} />} />
                        <StatCard value="$2M+" label="Platform Transactions" icon={<Shield size={24} />} />
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="app-container py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How Hire3 Works</h2>
                    <p className="text-muted text-lg max-w-2xl mx-auto">Get started in minutes with our streamlined process</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: '1', title: 'Create Your Profile', desc: 'Upload your resume, showcase your skills, and highlight your best work. AI-powered skill extraction saves you time.', icon: Users },
                        { step: '2', title: 'Discover Opportunities', desc: 'Browse curated roles from top teams. Filter by stack, compensation, remote options, and more.', icon: Briefcase },
                        { step: '3', title: 'Connect & Collaborate', desc: 'Apply directly, message founders, and start building together. No middlemen, just results.', icon: Zap },
                    ].map((item, i) => (
                        <div key={i} className="card-surface p-8 flex flex-col items-center gap-4 relative group hover:shadow-lg hover:border-primary/30 transition-all">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
                                {item.step}
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mt-4">
                                <item.icon size={28} />
                            </div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted text-center leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Demo Content: Talent & Jobs Preview */}
            <section className="bg-gradient-to-b from-background via-primary/5 to-background py-20">
                <div className="app-container grid gap-16 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Featured Talent</h2>
                                <p className="text-sm text-muted mt-1">Top professionals ready to work</p>
                            </div>
                            <Link to="/register" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Join now <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {talents.map(t => <TalentCard key={t.name} {...t} />)}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Latest Opportunities</h2>
                                <p className="text-sm text-muted mt-1">Fresh roles from top companies</p>
                            </div>
                            <Link to="/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {jobs.map(j => <JobSnippet key={j.title} {...j} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Hire3 Section */}
            <section className="app-container py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Teams Choose Hire3</h2>
                    <p className="text-muted text-lg max-w-2xl mx-auto">Purpose-built for the modern workforce</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Shield, title: 'Verified Credentials', desc: 'Skills verification, work history validation, and reputation scores you can trust.' },
                        { icon: Zap, title: 'Smart Matching', desc: 'AI-powered recommendations connect you with the right opportunities instantly.' },
                        { icon: Globe, title: 'Global Reach', desc: 'Access talent and opportunities worldwide with seamless cross-border payments.' },
                    ].map((item, i) => (
                        <div key={i} className="card-surface p-8 flex flex-col gap-4 items-center text-center hover:shadow-lg hover:border-primary/30 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <item.icon size={28} />
                            </div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-muted/5 border-y border-border/60 py-20">
                <div className="app-container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Teams Worldwide</h2>
                        <p className="text-muted text-lg">See what our community is saying</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="card-surface p-6 flex flex-col gap-4">
                                <div className="flex gap-1 text-amber-400">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-sm leading-relaxed flex-1">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{t.name}</p>
                                        <p className="text-xs text-muted">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="app-container py-20">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-blue-600 p-10 md:p-16 text-center">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
                            Ready to Transform Your Hiring?
                        </h2>
                        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
                            Join thousands of companies and professionals already building the future together.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg" className="px-10 py-5 text-base font-semibold bg-white text-primary hover:bg-gray-100 shadow-lg">
                                <Link to="/register">Start Hiring Today</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="px-10 py-5 text-base font-semibold border-white/30 text-white hover:bg-white/10">
                                <Link to="/dashboard">Browse Jobs</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
