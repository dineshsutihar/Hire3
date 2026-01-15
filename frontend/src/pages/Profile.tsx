import { useRecoilState } from 'recoil';
import { authAtom } from '../store/auth';
import { useForm } from 'react-hook-form';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { SkillInput } from '../components/SkillInput';
import { Card, CardTitle } from '../components/Card';
import React from 'react';
import { useToast } from '../components/Toast';
import { getProfile, updateProfile, parseResume, uploadAvatar, getJobMatches, JobMatch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    User,
    FileText,
    Briefcase,
    Link as LinkIcon,
    Wallet,
    Upload,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Camera,
    Save,
    RefreshCw,
    Star,
    Award,
    Shield,
    ImagePlus
} from 'lucide-react';

interface ProfileForm {
    name: string;
    bio: string;
    linkedin: string;
    wallet: string;
    resume?: FileList;
}

interface CompletionItem {
    key: string;
    label: string;
    completed: boolean;
    icon: React.ReactNode;
}

export const Profile = () => {
    const [auth, setAuth] = useRecoilState(authAtom);
    const user = auth.user;
    const { register, handleSubmit, reset, watch } = useForm<ProfileForm>({
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || '',
            linkedin: user?.linkedin || '',
            wallet: user?.wallet || ''
        }
    });
    const [skills, setSkills] = React.useState<string[]>(user?.skills || []);
    const [resumeName, setResumeName] = React.useState<string | null>(null);
    const [parsing, setParsing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const [parsedSections, setParsedSections] = React.useState<Record<string, string[]>>({});
    const [matches, setMatches] = React.useState<JobMatch[] | null>(null);
    const [loadingMatches, setLoadingMatches] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'profile' | 'resume' | 'settings'>('profile');
    const { notify } = useToast();

    const watchedName = watch('name');
    const watchedBio = watch('bio');
    const watchedLinkedin = watch('linkedin');
    const watchedWallet = watch('wallet');

    // Profile completion calculation
    const completionItems: CompletionItem[] = [
        { key: 'name', label: 'Full Name', completed: !!watchedName?.trim(), icon: <User className="h-4 w-4" /> },
        { key: 'bio', label: 'Professional Bio', completed: !!watchedBio?.trim(), icon: <FileText className="h-4 w-4" /> },
        { key: 'skills', label: 'Skills (3+)', completed: skills.length >= 3, icon: <Star className="h-4 w-4" /> },
        { key: 'linkedin', label: 'LinkedIn Profile', completed: !!watchedLinkedin?.trim(), icon: <LinkIcon className="h-4 w-4" /> },
        { key: 'wallet', label: 'Wallet Address', completed: !!watchedWallet?.trim(), icon: <Wallet className="h-4 w-4" /> },
    ];

    const completedCount = completionItems.filter(item => item.completed).length;
    const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

    const suggestions = ['React', 'TypeScript', 'Solidity', 'Rust', 'Node.js', 'GraphQL', 'DevOps', 'Python', 'AWS', 'Docker'];

    const onSubmit = async (data: ProfileForm) => {
        if (!auth.token) return;
        setSaving(true);
        try {
            const updated = await updateProfile(auth.token, {
                name: data.name,
                bio: data.bio,
                linkedin: data.linkedin,
                wallet: data.wallet,
                skills,
            });
            setAuth(prev => ({ ...prev, user: updated }));
            notify({ type: 'success', title: 'Profile saved', description: 'Your profile information was updated successfully.' });
            reset({ ...data, resume: undefined });
        } catch (e: any) {
            notify({ type: 'error', title: 'Update failed', description: e?.message || 'Please try again later.' });
        } finally {
            setSaving(false);
        }
    };

    React.useEffect(() => {
        (async () => {
            if (auth.token && auth.user) return;
            if (auth.token) {
                try {
                    const profile = await getProfile(auth.token);
                    setAuth(prev => ({ ...prev, user: profile }));
                } catch { /* ignore */ }
            }
        })();
    }, [auth.token, auth.user, setAuth]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.token) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            notify({ type: 'error', title: 'Invalid file type', description: 'Please upload a JPEG, PNG, GIF, or WebP image.' });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            notify({ type: 'error', title: 'File too large', description: 'Maximum file size is 5MB.' });
            return;
        }

        setUploadingAvatar(true);
        try {
            const updated = await uploadAvatar(auth.token, file);
            setAuth(prev => ({ ...prev, user: updated }));
            notify({ type: 'success', title: 'Avatar updated', description: 'Your profile picture has been updated.' });
        } catch (e: any) {
            notify({ type: 'error', title: 'Upload failed', description: e?.message || 'Please try again.' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleParseResume = async () => {
        if (!auth.token) return;
        const fileInput = document.querySelector('input[type=file][name=resume]') as HTMLInputElement;
        const f = fileInput?.files?.[0];
        if (!f) {
            notify({ type: 'error', title: 'No file selected', description: 'Please select a resume file to upload.' });
            return;
        }
        setParsing(true);
        try {
            const res = await parseResume(auth.token, f);
            const { parsed, skills: parsedSkills } = res;
            const mergedSkills = Array.from(new Set([...(skills || []), ...(parsedSkills || [])]));
            setSkills(mergedSkills);
            const newAdded = (parsedSkills || []).filter(s => !(skills || []).includes(s));
            const sectionMap: Record<string, string[]> = {};
            (['technical_skills', 'soft_skills', 'languages', 'tools'] as const).forEach(k => {
                const arr = (parsed as any)[k];
                if (Array.isArray(arr) && arr.length) sectionMap[k] = arr;
            });
            setParsedSections(sectionMap);
            notify({
                type: 'success',
                title: 'Resume parsed successfully',
                description: newAdded.length
                    ? `Added ${newAdded.length} new skills: ${newAdded.slice(0, 3).join(', ')}${newAdded.length > 3 ? '...' : ''}`
                    : 'Skills extracted successfully.'
            });
        } catch (e: any) {
            notify({ type: 'error', title: 'Parse failed', description: e?.message || 'Unable to parse resume.' });
        } finally {
            setParsing(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
                    <p className="text-muted-foreground mb-4">Please login to view and edit your profile.</p>
                    <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Avatar Section */}
                    <div className="relative group">
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt="Profile"
                                className="h-24 w-24 rounded-2xl object-cover border-4 border-white dark:border-neutral-800 shadow-lg"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className={`absolute -bottom-2 -right-2 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-md border hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
                            title="Change avatar"
                        >
                            {uploadingAvatar ? (
                                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4 text-muted-foreground" />
                            )}
                        </label>
                    </div>

                    {/* Name and Email */}
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{user.name || 'Complete your profile'}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {skills.slice(0, 4).map(skill => (
                                <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                    {skill}
                                </span>
                            ))}
                            {skills.length > 4 && (
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 text-muted-foreground text-xs rounded-full">
                                    +{skills.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Completion Badge */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border">
                        <div className="relative">
                            <svg className="w-14 h-14 transform -rotate-90">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="24"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-gray-200 dark:text-neutral-700"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="24"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${completionPercentage * 1.51} 151`}
                                    className={completionPercentage === 100 ? 'text-green-500' : 'text-primary'}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                {completionPercentage}%
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Profile Completion</p>
                            <p className="text-xs text-muted-foreground">{completedCount}/{completionItems.length} complete</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar - Completion Checklist */}
                <div className="lg:col-span-1">
                    <Card className="p-5 sticky top-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Complete Your Profile
                        </h3>
                        <div className="space-y-3">
                            {completionItems.map(item => (
                                <div
                                    key={item.key}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${item.completed
                                        ? 'bg-green-50 dark:bg-green-900/20'
                                        : 'bg-gray-50 dark:bg-neutral-800'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-full ${item.completed
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-200 dark:bg-neutral-700 text-muted-foreground'
                                        }`}>
                                        {item.completed ? <CheckCircle className="h-4 w-4" /> : item.icon}
                                    </div>
                                    <span className={`text-sm ${item.completed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {completionPercentage < 100 && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Complete your profile to increase visibility to employers by up to 3x!
                                    </p>
                                </div>
                            </div>
                        )}

                        {completionPercentage === 100 && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-green-700 dark:text-green-400">
                                        Your profile is complete! You're now visible to top employers.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Main Content - Profile Form */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Info Section */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Basic Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <InputField label="Full Name" {...register('name')} required placeholder="John Doe" />
                                    <InputField
                                        label="LinkedIn Profile"
                                        type="url"
                                        placeholder="https://linkedin.com/in/username"
                                        {...register('linkedin')}
                                    />
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Professional Summary
                                </h3>
                                <textarea
                                    {...register('bio')}
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Write a brief professional summary highlighting your experience, expertise, and what you're looking for..."
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    A compelling bio helps employers understand your background quickly.
                                </p>
                            </div>

                            {/* Skills Section */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Skills & Expertise
                                </h3>
                                <SkillInput value={skills} onChange={setSkills} label="" />
                                <div className="mt-3">
                                    <p className="text-xs text-muted-foreground mb-2">Popular skills:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setSkills([...skills, s])}
                                                className="text-xs px-3 py-1.5 rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Section */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-primary" />
                                    Web3 Wallet
                                </h3>
                                <InputField
                                    label=""
                                    placeholder="Enter your Solana wallet address (e.g., 7xKX...)"
                                    {...register('wallet')}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Used for receiving payments. Supports Solana addresses.
                                </p>
                            </div>

                            {/* Resume Upload Section */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" />
                                    Resume & AI Parsing
                                </h3>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        {...register('resume')}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                setResumeName(f.name);
                                                notify({ type: 'info', title: 'Resume selected', description: f.name });
                                            } else {
                                                setResumeName(null);
                                            }
                                        }}
                                        className="hidden"
                                        id="resume-upload"
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer">
                                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium mb-1">
                                            {resumeName || 'Click to upload your resume'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PDF or DOC up to 10MB
                                        </p>
                                    </label>
                                </div>

                                {resumeName && (
                                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="text-sm truncate max-w-[200px]">{resumeName}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={parsing}
                                            onClick={handleParseResume}
                                            className="flex items-center gap-2"
                                        >
                                            {parsing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    Parsing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4" />
                                                    Extract Skills
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {Object.keys(parsedSections).length > 0 && (
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        {Object.entries(parsedSections).map(([k, vals]) => (
                                            <div key={k} className="rounded-lg border p-3">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {k.replace(/_/g, ' ')}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {vals.map(v => (
                                                        <span
                                                            key={v}
                                                            className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5"
                                                        >
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
