'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { hashPassword } from '@/lib/crypto';

import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!agreed) {
            toast.error('You must agree to the Terms of Service to create an account.');
            return;
        }

        setIsLoading(true);
        // ... rest of logic

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const plainPassword = formData.get('password') as string;
        const name = formData.get('name') as string;

        try {
            // Hash password before sending to server
            const hashedPassword = await hashPassword(plainPassword);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: hashedPassword, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            toast.success('Account created successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
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
                    className="object-cover opacity-60 scale-x-[-1] blur-[10px] brightness-[0.8] backdrop-blur-[10px]"
                    priority
                />
                <div className="relative z-10 p-12 max-w-lg text-white">
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            C
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ImageCompress</span>
                    </Link>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/20">
                            <Zap className="w-4 h-4 text-accent" />
                            <span className="text-xs text-accent font-bold uppercase tracking-widest">Join the Pro Tier</span>
                        </div>

                        <h2 className="text-4xl font-bold leading-tight">
                            Start Optimizing Like a <span className="text-primary italic">Pro</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Unlimited Batches</h3>
                                    <p className="text-zinc-400 text-sm">Compress up to 1000 images at once without sweating.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/20 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Privacy First</h3>
                                    <p className="text-zinc-400 text-sm">Your data never leaves your browser. Local processing only.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000" />
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
                        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-muted-foreground">
                            Sign up today and optimize your assets
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="h-11 bg-muted/30"
                                />
                            </div>
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
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-11 bg-muted/30"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 py-2">
                            <Checkbox
                                id="terms"
                                checked={agreed}
                                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer select-none">
                                I agree to the <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                            </Label>
                        </div>

                        <Button
                            className="w-full h-11 text-base font-semibold shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading || !agreed}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-semibold tracking-tight">
                            Sign in
                        </Link>
                    </p>
                </div>


            </div>
        </div>
    );
}
