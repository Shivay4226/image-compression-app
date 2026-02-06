import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Sparkles, Shield, Zap, Globe, Cpu, Layers } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: "Privacy First",
      description: "Local-first processing means your sensitive images never leave your machine. No server uploads, no privacy leaks."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "WASM Powered",
      description: "Optimized WebAssembly cores ensure near-instant compression with performance matching native applications."
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      title: "Batch Processing",
      description: "Handle up to 1000 images at once with our Pro tier. Intelligent parallel processing for maximum speed."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "Universal Support",
      description: "Seamlessly convert and optimize PNG, JPG, WebP, and AVIF. Total control over quality and output format."
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-500" />,
      title: "CPU Optimized",
      description: "Efficient algorithms that respect your battery life and system resources while delivering top-tier results."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "Smart Presets",
      description: "Industry-standard compression profiles for web, print, and social media. Quality you can trust."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <main className="flex-1 w-full mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Capabilities</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Power Packed <span className="text-primary italic">Features</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Precision tools built for developers, designers, and large scale content pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all group"
              >
                <div className="p-4 rounded-2xl bg-muted w-fit mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
