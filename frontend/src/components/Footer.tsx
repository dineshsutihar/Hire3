import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border/60 bg-background/70 backdrop-blur-md mt-auto">
            <div className="app-container py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-sm">
                <div className="space-y-1">
                    <p className="font-semibold tracking-tight">Hire3</p>
                    <p className="text-muted">Connecting talent and opportunity.</p>
                </div>
                <div className="flex flex-wrap gap-5">
                    <Link to="/" className="text-muted hover:text-foreground transition-colors">Home</Link>
                    <a href="/legal/terms" className="text-muted hover:text-foreground transition-colors">Terms</a>
                    <a href="/legal/privacy" className="text-muted hover:text-foreground transition-colors">Privacy</a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">GitHub</a>
                </div>
                <p className="text-xs text-muted">© {new Date().getFullYear()} Hire3. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
