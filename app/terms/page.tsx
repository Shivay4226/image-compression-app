import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ScrollText, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
                <div className="space-y-12">


                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <ScrollText className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Legal Framework</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms of <span className="text-primary italic">Service</span></h1>
                        <p className="text-lg text-muted-foreground">
                            Last updated: February 1, 2026
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: ShieldCheck, title: "Privacy Guarantee", desc: "Your images never leave your browser. We process everything locally.", color: "text-accent" },
                            { icon: Scale, title: "Fair Usage", desc: "Limits apply based on your plan tier to ensure service stability.", color: "text-primary" },
                            { icon: FileText, title: "Data Ownership", desc: "You retain 100% ownership of any data processed through our tools.", color: "text-zinc-400" }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:bg-muted/50 transition-colors">
                                <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="prose prose-zinc prose-invert max-w-none space-y-12 bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 shadow-xl">
                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">1. Acceptance of Terms</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                By accessing or using ImageCompress, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use the platform. We reserve the right to modify these terms at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">2. Description of Service</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                ImageCompress provides browser-based image optimization and conversion tools. The service is provided "as is" and "as available". We offer free and paid "Pro" tiers with different processing limits.
                            </p>
                        </section>

                        <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6" />
                                3. Privacy and Local Processing
                            </h2>
                            <p className="text-zinc-300 leading-relaxed text-lg italic mb-4">
                                A core principle of ImageCompress is privacy.
                            </p>
                            <p className="text-zinc-300 leading-relaxed text-lg">
                                All image compression and conversion logic is executed within your local browser environment. We do not upload your image files to our servers for processing. Metadata may be collected for analytical and subscription validation purposes only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">4. Subscriptions and Payments</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                Pro subscriptions grant access to higher batch limits and priority features. Payments are handled via secure third-party processors. Subscriptions can be cancelled at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">5. Limitation of Liability</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                In no event shall ImageCompress be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                            </p>
                        </section>
                    </div>

                    <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                        <p className="text-base text-muted-foreground text-center md:text-left">
                            Questions about our terms? <br className="md:hidden" />
                            <Link href="mailto:legal@imagecompress.com" className="text-primary hover:underline font-medium">Contact our legal team</Link>
                        </p>
                        <Button asChild size="lg" className="rounded-full px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            <Link href="/register">Accept & Return</Link>
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
