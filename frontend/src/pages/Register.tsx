import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { authAtom, isAuthedSelector } from '../store/auth';
import { registerUser } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle } from '../components/Card';
import { useToast } from '../components/Toast';

const schema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Min 6 chars'),
    confirmPassword: z.string().min(6, 'Confirm password')
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export const Register = () => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting, isValid }, trigger } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange', reValidateMode: 'onChange' });
    const setAuth = useSetRecoilState(authAtom);
    const navigate = useNavigate();
    const { notify } = useToast();
    const isAuthed = useRecoilValue(isAuthedSelector);

    // Revalidate confirm password when password changes
    const pwd = watch('password');
    React.useEffect(() => { if (pwd) { void trigger('confirmPassword'); } }, [pwd, trigger]);

    React.useEffect(() => {
        if (isAuthed) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthed, navigate]);

    const onSubmit = async (data: FormData) => {
        try {
            const { token, user } = await registerUser({ name: data.name, email: data.email, password: data.password });
            setAuth(prev => ({ ...prev, token, user }));
            notify({ type: 'success', title: 'Account created' });
            navigate('/profile');
        } catch (e: any) {
            notify({ type: 'error', title: 'Registration failed', description: e?.message || 'Try again later.' });
        }
    };

    return (
        <div className="app-container py-12">
            <div className="mx-auto w-full max-w-xl card-surface px-10 py-12 space-y-8">
                <div className="space-y-2 text-center">
                    <CardTitle className="text-3xl tracking-tight">Create your account</CardTitle>
                    <p className="text-sm text-muted">Start building your professional graph.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <InputField label="Name" autoComplete="name" {...register('name')} error={errors.name?.message} required />
                        <InputField label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} required />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <InputField label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} required />
                        <InputField label="Confirm Password" type="password" autoComplete="new-password" {...register('confirmPassword')} error={errors.confirmPassword?.message} required />
                    </div>
                    <div className="flex items-start gap-3 rounded-md border border-border/60 dark:border-border/30 bg-background/40 p-4">
                        <input type="checkbox" className="mt-1 h-4 w-4" required />
                        <p className="text-xs text-muted leading-relaxed">I agree to the <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>. I consent to receive relevant emails and can unsubscribe anytime.</p>
                    </div>
                    <Button disabled={isSubmitting || !isValid} className="h-12 text-sm font-medium tracking-wide">{isSubmitting ? 'Creating...' : 'Create Account'}</Button>
                </form>
            </div>
        </div>
    );
};

export default Register;
