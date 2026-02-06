'use client';

import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail, Zap } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/30 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4 col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                                C
                            </div>
                            <span>ImageCompress</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Professional-grade image optimization, directly in your browser. Fast, secure, and privacy-focused.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Image Compressor</Link></li>
                            <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/subscription" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing & Pro</Link></li>
                            <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support & FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Stay Updated</h4>
                        <p className="text-sm text-muted-foreground">Subscribe for high-quality updates on image tools.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity">
                                <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} ImageCompress. Built with Privacy by Design.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> support@imagecompress.com</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
