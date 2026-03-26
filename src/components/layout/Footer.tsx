import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Instagram } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="relative z-10 px-4 sm:px-6 lg:px-8 pt-12 pb-10 border-t-2 border-navy/10 bg-white/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start justify-between">
                    <div className="lg:col-span-5 space-y-6">
                        <BrandLogo size="lg" />
                        <p className="font-jakarta text-navy-light text-sm leading-relaxed max-w-sm">
                            Survey Panel Go connects curious people with brands that want to listen—earn rewards for sharing your honest take.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.linkedin.com/company/surveypanelgo/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white border-2 border-navy rounded-xl flex items-center justify-center hover:bg-violet hover:text-white transition-all shadow-hard group"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                            <a
                                href="https://www.instagram.com/surveypanelgo?igsh=NHpiNDVhMjFsa3Vs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white border-2 border-navy rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-hard group"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    </div>
                    <div className="lg:col-span-7 flex flex-wrap gap-8 lg:gap-16 text-sm">
                        <div>
                            <p className="font-outfit font-bold text-navy mb-4 text-base">Explore</p>
                            <ul className="space-y-3 font-jakarta text-navy-light">
                                <li>
                                    <a href="/#features" className="hover:text-violet transition-colors">
                                        How it works
                                    </a>
                                </li>
                                <li>
                                    <a href="/services" className="hover:text-violet transition-colors">
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a href="/blog" className="hover:text-violet transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="/about" className="hover:text-violet transition-colors">
                                        About Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-outfit font-bold text-navy mb-4 text-base">Account</p>
                            <ul className="space-y-3 font-jakarta text-navy-light">
                                <li>
                                    <button type="button" onClick={() => navigate('/auth')} className="hover:text-violet transition-colors text-left">
                                        Sign in
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => navigate('/auth')} className="hover:text-violet transition-colors text-left">
                                        Join Our Panel
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-outfit font-bold text-navy mb-4 text-base">Legal</p>
                            <ul className="space-y-3 font-jakarta text-navy-light">
                                <li>
                                    <span className="hover:text-violet transition-colors cursor-pointer">Privacy Policy</span>
                                </li>
                                <li>
                                    <span className="hover:text-violet transition-colors cursor-pointer">Terms of Service</span>
                                </li>
                                <li>
                                    <a href="/contact" className="hover:text-violet transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-navy/10 space-y-6">
                    <div className="rounded-2xl border-2 border-navy bg-periwinkle/50 px-5 py-5 sm:px-8 sm:py-6">
                        <p className="font-outfit font-bold text-navy text-sm uppercase tracking-wide mb-3">Credits</p>
                        <p className="font-jakarta text-navy text-sm sm:text-base">
                            <span className="text-navy-light">Owner:</span>{' '}
                            <span className="font-semibold">Rohit Singh</span>
                        </p>
                        <p className="font-jakarta text-navy text-sm sm:text-base mt-2">
                            <span className="text-navy-light">Website created by</span>{' '}
                            <a
                                href="https://shivamweb.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-violet underline decoration-2 underline-offset-2 hover:opacity-90 transition-all font-jakarta"
                            >
                                ShivamWeb
                            </a>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <p className="font-jakarta text-sm text-navy-light">
                            © {new Date().getFullYear()} Survey Panel Go. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="font-jakarta text-sm text-navy-light">© India</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
