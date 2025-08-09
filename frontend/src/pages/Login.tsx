import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { authAtom, isAuthedSelector } from '../store/auth';
import { loginUser } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { CardTitle } from '../components/Card';
import { useToast } from '../components/Toast';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

type FormData = z.infer<typeof schema>;

export const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
    const setAuth = useSetRecoilState(authAtom);
    const navigate = useNavigate();
    const { notify } = useToast();
    const isAuthed = useRecoilValue(isAuthedSelector);

    React.useEffect(() => {
        if (isAuthed) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthed, navigate]);

    const onSubmit = async (data: FormData) => {
        try {
            const { token, user } = await loginUser({ email: data.email, password: data.password });
            setAuth(prev => ({ ...prev, token, user }));
            notify({ type: 'success', title: 'Logged in' });
            navigate('/dashboard');
        } catch (e: any) {
            notify({ type: 'error', title: 'Login failed', description: e?.message || 'Please try again.' });
        }
    };

    return (
        <div className="app-container py-12">
            <div className="mx-auto w-full max-w-md card-surface px-8 py-10 space-y-8">
                <div className="space-y-2 text-center">
                    <CardTitle className="text-3xl tracking-tight">Sign in</CardTitle>
                    <p className="text-sm text-muted">Welcome back. Access your dashboard.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <InputField label="Email" type="email" {...register('email')} error={errors.email?.message} required />
                    <InputField label="Password" type="password" {...register('password')} error={errors.password?.message} required />
                    <Button disabled={isSubmitting} className="h-11 text-sm font-medium tracking-wide">{isSubmitting ? 'Signing in...' : 'Login'}</Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
