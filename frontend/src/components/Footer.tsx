import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border/60 bg-background mt-auto">
            <div className="app-container py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                H3
                            </div>
                            <span className="text-lg font-bold">Hire3</span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                            The Web3-native platform connecting exceptional talent with innovative teams.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors">
                                <Twitter size={16} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors">
                                <Linkedin size={16} />
                            </a>
                            <a href="https://github.com/dineshsutihar/Hire3" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors">
                                <Github size={16} />
                            </a>
                            <a href="mailto:contact@hire3.io" className="h-9 w-9 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors">
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/dashboard" className="text-muted hover:text-foreground transition-colors">Find Jobs</Link></li>
                            <li><Link to="/dashboard" className="text-muted hover:text-foreground transition-colors">Post a Job</Link></li>
                            <li><Link to="/profile" className="text-muted hover:text-foreground transition-colors">Build Profile</Link></li>
                            <li><Link to="/payments" className="text-muted hover:text-foreground transition-colors">Payments</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/about" className="text-muted hover:text-foreground transition-colors">About Us</a></li>
                            <li><a href="/careers" className="text-muted hover:text-foreground transition-colors">Careers</a></li>
                            <li><a href="/blog" className="text-muted hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="/contact" className="text-muted hover:text-foreground transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/legal/terms" className="text-muted hover:text-foreground transition-colors">Terms of Service</a></li>
                            <li><a href="/legal/privacy" className="text-muted hover:text-foreground transition-colors">Privacy Policy</a></li>
                            <li><a href="/legal/cookies" className="text-muted hover:text-foreground transition-colors">Cookie Policy</a></li>
                            <li><a href="/legal/security" className="text-muted hover:text-foreground transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
                    <p>© {new Date().getFullYear()} Hire3. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
