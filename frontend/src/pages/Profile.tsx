import { useRecoilState } from 'recoil';
import { authAtom } from '../store/auth';
import { useForm } from 'react-hook-form';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { SkillInput } from '../components/SkillInput';
import { Card, CardTitle } from '../components/Card';
import React from 'react';
import { useToast } from '../components/Toast';
import { getProfile, updateProfile, parseResume, getJobMatches, JobMatch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProfileForm {
    name: string;
    bio: string;
    linkedin: string;
    wallet: string;
    resume?: FileList;
}

export const Profile = () => {
    const [auth, setAuth] = useRecoilState(authAtom);
    const user = auth.user;
    const { register, handleSubmit, reset } = useForm<ProfileForm>({
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
    const [parsedSections, setParsedSections] = React.useState<Record<string, string[]>>({});
    const [matches, setMatches] = React.useState<JobMatch[] | null>(null);
    const [loadingMatches, setLoadingMatches] = React.useState(false);
    const { notify } = useToast();
    const suggestions = ['React', 'TypeScript', 'Solidity', 'Rust', 'Node.js', 'GraphQL', 'DevOps'];

    const onSubmit = async (data: ProfileForm) => {
        if (!auth.token) return;
        try {
            const updated = await updateProfile(auth.token, {
                name: data.name,
                bio: data.bio,
                linkedin: data.linkedin,
                wallet: data.wallet,
                skills,
            });
            setAuth(prev => ({ ...prev, user: updated }));
            notify({ type: 'success', title: 'Profile saved', description: 'Your profile information was updated.' });
            reset({ ...data, resume: undefined });
        } catch (e: any) {
            notify({ type: 'error', title: 'Update failed', description: e?.message || 'Try again later.' });
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

    if (!user) return <div className="p-6 text-center">Please login.</div>;



    return (
        <div className="mx-auto max-w-3xl px-8 py-12">
            <Card className="p-8 shadow-lg border border-border/70 bg-white dark:bg-neutral-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-bold mb-1">My Profile</CardTitle>
                        <p className="text-muted text-sm">Update your information to help teams find you.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover border border-border" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-border">
                                {user?.name?.[0] || '?'}
                            </div>
                        )}
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
                    <div className="grid gap-6 md:grid-cols-2">
                        <InputField label="Name" {...register('name')} required />
                        <InputField label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/username" {...register('linkedin')} />
                    </div>
                    <div>
                        <span className="block text-sm font-medium mb-1 text-foreground/90">Bio</span>
                        <textarea
                            {...register('bio')}
                            rows={4}
                            className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/60 dark:bg-white/5"
                            placeholder="Brief professional summary"
                        />
                    </div>
                    <div>
                        <SkillInput value={skills} onChange={setSkills} label="Skills" />
                        <div className="flex flex-wrap gap-2 text-xs mt-2">
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => !skills.includes(s) && setSkills([...skills, s])}
                                    className="rounded-full border border-border/70 px-3 py-1 hover:bg-primary/10 hover:border-primary/40 transition"
                                >
                                    + {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <InputField label="Public Wallet Address" placeholder="0x..." {...register('wallet')} />
                    <div className="flex flex-col gap-2 text-sm font-medium mt-4">
                        <span className="text-foreground/90 mb-1">Resume (PDF)</span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                                className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 dark:bg-white/5"
                            />
                            <Button
                                type="button"
                                disabled={!auth.token || !resumeName || parsing}
                                onClick={async () => {
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
                                        // Merge parsed skills with current skills, dedupe
                                        const mergedSkills = Array.from(new Set([...(skills || []), ...(parsedSkills || [])]));
                                        setSkills(mergedSkills);
                                        // Optionally, show which new skills were added
                                        const newAdded = (parsedSkills || []).filter(s => !(skills || []).includes(s));
                                        const sectionMap: Record<string, string[]> = {};
                                        (['technical_skills', 'soft_skills', 'languages', 'tools'] as const).forEach(k => {
                                            const arr = (parsed as any)[k];
                                            if (Array.isArray(arr) && arr.length) sectionMap[k] = arr;
                                        });
                                        setParsedSections(sectionMap);
                                        notify({
                                            type: 'success',
                                            title: 'Resume parsed',
                                            description: newAdded.length
                                                ? `Added skills: ${newAdded.join(', ')}`
                                                : 'Skills extracted successfully.'
                                        });
                                    } catch (e: any) {
                                        notify({ type: 'error', title: 'Parse failed', description: e?.message || 'Unable to parse resume.' });
                                    } finally {
                                        setParsing(false);
                                    }
                                }}
                                className="h-10 whitespace-nowrap"
                            >{parsing ? <><LoadingSpinner /> Parsing...</> : 'Extract Skills'}</Button>
                        </div>
                        {resumeName && <span className="text-xs text-muted">Selected: {resumeName}</span>}
                        {Object.keys(parsedSections).length > 0 && (
                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                                {Object.entries(parsedSections).map(([k, vals]) => (
                                    <div key={k} className="rounded-md border border-border/60 p-3 bg-white/5">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{k.replace(/_/g, ' ')}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {vals.map(v => <span key={v} className="text-[11px] rounded bg-primary/10 text-primary px-2 py-1">{v}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button className="h-11 px-8 text-base font-semibold">Save Profile</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Profile;
