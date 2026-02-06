'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { hashPassword } from '@/lib/crypto';
import { SearchParamsProvider } from './search-params-provider';

function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const plainPassword = formData.get('password') as string;

        try {
            // Hash password before sending to server
            const hashedPassword = await hashPassword(plainPassword);

            const result = await signIn('credentials', {
                email,
                password: hashedPassword,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Logged in successfully');
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">
                <Image
                    src="/auth-bg.png"
                    alt="Premium Background"
                    fill
                    className="object-cover opacity-60 blur-[10px] brightness-[0.8] backdrop-blur-[10px]"
                    priority
                />
                <div className="relative z-10 p-12 max-w-lg text-white">
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            C
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ImageCompress</span>
                    </Link>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold leading-tight">
                            Professional Tools for <span className="text-accent underline decoration-accent/30 underline-offset-8">Creative Visuals</span>
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            Join thousands of professionals optimizing their workflows with secure, local, and lightning-fast image compression.
                        </p>

                        <ul className="space-y-4 pt-4">
                            <li className="flex items-center gap-3 text-zinc-300">
                                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                </div>
                                100% Secure Local Processing
                            </li>
                            <li className="flex items-center gap-3 text-zinc-300">
                                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-accent" />
                                </div>
                                Batch Process up to 1000 Images
                            </li>
                            <li className="flex items-center gap-3 text-zinc-300">
                                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-accent" />
                                </div>
                                AI-Powered Smart Optimization
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-1/4 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background">
                <Link
                    href="/"
                    className="lg:hidden flex items-center gap-2 mb-12 self-start"
                >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        C
                    </div>
                    <span className="text-xl font-bold">ImageCompress</span>
                </Link>

                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-11 bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-11 bg-muted/30"
                                />
                            </div>
                        </div>

                        <Button className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-10 bg-transparent opacity-50 cursor-not-allowed" disabled>
                                Google
                            </Button>
                            <Button variant="outline" className="h-10 bg-transparent opacity-50 cursor-not-allowed" disabled>
                                GitHub
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        New here?{' '}
                        <Link href="/register" className="text-primary hover:underline font-semibold tracking-tight">
                            Create an account
                        </Link>
                    </p>
                </div>


            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchParamsProvider>
                <LoginForm />
            </SearchParamsProvider>
        </Suspense>
    );
}
