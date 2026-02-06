'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, KeyRound, Mail, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;

        // Mocking the API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Recovery instruction sent to your email');
            setIsSubmitted(true);
        } catch (error) {
            toast.error('Failed to send recovery email');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Visuals (Consistent with Auth pages) */}
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
                        <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-8 border border-accent/20">
                            <KeyRound className="w-8 h-8 text-accent" />
                        </div>

                        <h2 className="text-4xl font-bold leading-tight">
                            Secure <span className="text-accent underline decoration-accent/30 underline-offset-8">Account Recovery</span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            Don't worry, it happens to the best of us. We'll help you get back into your workspace in no time.
                        </p>

                        <div className="pt-8 grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-3 text-zinc-300 p-4 rounded-xl bg-white/5 border border-white/10">
                                <ShieldCheck className="w-5 h-5 text-accent" />
                                <span>Encrypted Security Links</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300 p-4 rounded-xl bg-white/5 border border-white/10">
                                <Mail className="w-5 h-5 text-accent" />
                                <span>Instant Recovery Dispatch</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-1/4 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">C</div>
                        <span className="font-bold text-xl tracking-tight">ImageCompress</span>
                    </Link>
                </div>

                {!isSubmitted ? (
                    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Forgot Password?</h1>
                            <p className="text-muted-foreground text-lg">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    className="h-12 bg-muted/30 border-border focus:ring-primary/20"
                                />
                            </div>

                            <Button className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    'Send Recovery Link'
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground pt-4">
                            Remembered your password?{' '}
                            <Link href="/login" className="text-primary hover:underline font-bold">
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                            <Mail className="w-10 h-10 text-primary" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">Check your email</h1>
                            <p className="text-muted-foreground text-lg">
                                We've sent a recovery link to your inbox. Please check your spam folder if you don't see it.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => setIsSubmitted(false)}>
                                Try another email
                            </Button>
                            <Button asChild variant="ghost" className="w-full">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
