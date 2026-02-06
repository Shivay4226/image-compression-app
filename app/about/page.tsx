import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Heart, Users, Target, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/4 right-0 -mr-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 -ml-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <main className="flex-1 w-full mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Who We Are</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Our <span className="text-primary italic">Mission</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We started ImageCompress with a simple goal: create the fastest, most secure image optimization tool that works entirely in the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-pretty">
            <div className="space-y-6 prose prose-zinc prose-invert max-w-none">
              <h2 className="text-3xl font-bold tracking-tight">Privacy by Design</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                In a world where privacy is often an afterthought, we believe that your personal and professional assets should stay under your control. By leveraging the power of modern Browser APIs and WebAssembly, we eliminated the need for server-side processing, meaning your data stays with you.
              </p>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Whether you're a web developer looking to shave off those crucial few kilobytes or a photographer handling thousands of assets, ImageCompress is built to scale with your needs while keeping your workflow private and efficient.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl group-hover:bg-primary/40 transition-colors pointer-events-none" />
              <div className="relative aspect-square rounded-3xl bg-secondary flex items-center justify-center border border-border/50 overflow-hidden shadow-2xl">
                <Target className="w-32 h-32 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 border-t border-border/50">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary tracking-tighter">100%</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Local Processing</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary tracking-tighter">0</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Images Uploaded</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary tracking-tighter">∞</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Privacy Protected</p>
            </div>
          </div>

          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-primary/20 text-center space-y-6 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20 shadow-xl">
                <Heart className="w-8 h-8 text-primary fill-primary/20" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Built for creators, by creators.</h3>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">Thank you for being part of our journey to make the web faster and more private.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
