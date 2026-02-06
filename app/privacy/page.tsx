import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Lock, Database, EyeOff, Key, UserCheck } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-0 -ml-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
                <div className="space-y-12">


                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                            <Lock className="w-4 h-4 text-accent" />
                            <span className="text-xs font-bold uppercase tracking-widest text-accent">Privacy First Architecture</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy <span className="text-accent italic">Policy</span></h1>
                        <p className="text-lg text-muted-foreground">
                            How we protect your data at ImageCompress.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: EyeOff, title: "Zero Visibility", desc: "We cannot see your images. Processing happens entirely within your browser.", color: "text-accent" },
                            { icon: Database, title: "No Storage", desc: "Your original and compressed images are never stored on our servers.", color: "text-primary" },
                            { icon: Key, title: "Secure Auth", desc: "Industry-standard encryption for your account credentials.", color: "text-zinc-400" }
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
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">1. Data Collection</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                We collect minimal personal information required to maintain your account:
                            </p>
                            <ul className="list-disc list-inside text-zinc-400 space-y-3 ml-4 text-lg">
                                <li>Email address for account identification</li>
                                <li>Hashed passwords (encrypted and unreadable by us)</li>
                                <li>Subscription status and billing information</li>
                                <li>Usage analytics (standard web server logs)</li>
                            </ul>
                        </section>

                        <section className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
                            <h2 className="text-2xl font-bold text-accent mb-4 flex items-center gap-2">
                                <Database className="w-6 h-6" />
                                2. Local Processing Model
                            </h2>
                            <p className="text-zinc-300 leading-relaxed text-lg">
                                Unlike many online converters, ImageCompress utilizes <strong>WebAssembly and Client-Side APIs</strong> to process images locally. This means:
                            </p>
                            <ul className="list-disc list-inside text-zinc-300 space-y-3 ml-4 mt-4 text-lg">
                                <li>Your image data is never transmitted to our servers for processing.</li>
                                <li>All optimization happens in your browser's RAM.</li>
                                <li>Once you close the tab, the temporary image data is wiped from memory.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">3. Security Measures</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                We protect your account data using:
                            </p>
                            <ul className="list-disc list-inside text-zinc-400 space-y-3 ml-4 text-lg">
                                <li>Bcrypt hashing for password security.</li>
                                <li>TLS/SSL encryption for all web traffic.</li>
                                <li>Secure JWT tokens for session management.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-border/50 pb-4 mb-6">4. Third-Party Services</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                We use Vercel for hosting and MongoDB for user management. These providers comply with international security standards (SOC2, ISO 27001). Payment information is processed exclusively by our payment partners (e.g., Stripe) and never hits our database.
                            </p>
                        </section>
                    </div>

                    <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shadow-inner shadow-accent/20">
                                <UserCheck className="w-6 h-6 text-accent" />
                            </div>
                            <p className="text-base text-muted-foreground text-center md:text-left">
                                Your privacy is our <span className="text-foreground font-bold italic">Top Priority</span>.
                            </p>
                        </div>
                        <Button variant="outline" asChild size="lg" className="rounded-full px-10 hover:bg-accent/10 border-accent/20 transition-all font-medium">
                            <Link href="/register">Understood, Back to Sign Up</Link>
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
