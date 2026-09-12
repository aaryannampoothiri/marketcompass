"use client";

import React, { useState } from 'react';

export interface NavLink {
    label: string;
    href: string;
    isActive?: boolean;
}

export interface DatasetStat {
    value: string;
    label: string;
}

export interface MarketCompassHeroProps {
    logoText?: string;
    backgroundImageUrl?: string;
    navLinks?: NavLink[];
    ctaButtonText?: string;
    ctaButtonHref?: string;
    badgeLabel?: string;
    badgeText?: string;
    title?: string;
    titleLine2?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonHref?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    statsTitle?: string;
    stats?: DatasetStat[];
}

const MarketCompassHero: React.FC<MarketCompassHeroProps> = ({
    logoText = "Market Compass",
    backgroundImageUrl = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    navLinks = [
        { label: "Home", href: "#", isActive: true },
        { label: "Explore Corridors", href: "#" },
        { label: "Find a Business", href: "#" },
        { label: "Find a Location", href: "#" },
        { label: "Methodology", href: "#" }
    ],
    ctaButtonText = "Explore Opportunities",
    ctaButtonHref = "#dashboard",
    badgeLabel = "Data-Driven",
    badgeText = "Explore Business Opportunities Across Urban Corridors",
    title = "Find the Right Business.",
    titleLine2 = "In the Right Place.",
    description = "Market Compass connects business ideas, audiences, timing, and locations to help you discover where opportunities make sense. Explore a corridor, or start with a business idea.",
    primaryButtonText = "I Have a Business Idea",
    primaryButtonHref = "#business-to-corridor",
    secondaryButtonText = "I Have a Place",
    secondaryButtonHref = "#corridor-to-business",
    statsTitle = "Powered by real urban location intelligence",
    stats = [
        { value: "2", label: "Cities" },
        { value: "100+", label: "Corridors" },
        { value: "48", label: "Audience Segments" },
        { value: "24", label: "Business Archetypes" },
        { value: "500+", label: "Mapped Places" }
    ]
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <section className="w-full isolate min-h-screen overflow-hidden relative font-sans">
            {/* Background image for urban intelligence feel */}
            <img
                src={backgroundImageUrl}
                alt="Aerial view of urban city grid"
                className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
            />
            {/* Dark gradient overlay for text readability and premium look */}
            <div className="pointer-events-none absolute inset-0 bg-slate-950/70" />

            <header className="z-10 xl:top-4 relative">
                <div className="mx-6">
                    <div className="flex items-center justify-between pt-4">
                        {/* Text-based brand treatment with compass icon */}
                        <a
                            href="#"
                            className="inline-flex items-center justify-center text-xl font-bold tracking-tight text-white gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-400">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                            </svg>
                            {logoText}
                        </a>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-white/10 px-1 py-1 ring-1 ring-white/20 backdrop-blur-md">
                                {navLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className={`px-4 py-2 text-sm font-medium hover:text-white transition-colors ${link.isActive ? 'text-white bg-white/10 rounded-full' : 'text-slate-200'
                                            }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={ctaButtonHref}
                                    className="ml-1 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
                                >
                                    {ctaButtonText}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </nav>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                                {mobileMenuOpen ? (
                                    <path d="M18 6 6 18M6 6l12 12" />
                                ) : (
                                    <>
                                        <path d="M4 6h16" />
                                        <path d="M4 12h16" />
                                        <path d="M4 18h16" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 rounded-2xl bg-slate-900/95 ring-1 ring-white/20 backdrop-blur-xl p-4 animate-fade-slide-in-1">
                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${link.isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={ctaButtonHref}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-2 inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
                                >
                                    {ctaButtonText}
                                </a>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            <div className="z-10 relative">
                <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-24 px-6 pb-16">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Data-Driven Badge */}
                        <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-slate-900/50 px-2.5 py-2 ring-1 ring-white/20 backdrop-blur-md animate-fade-slide-in-1">
                            <span className="inline-flex items-center text-xs font-semibold tracking-wide text-emerald-950 bg-emerald-400 rounded-full py-1 px-3">
                                {badgeLabel}
                            </span>
                            <span className="text-sm font-medium text-slate-200 pr-2">
                                {badgeText}
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-bold animate-fade-slide-in-2">
                            {title}
                            <br />
                            <span className="text-emerald-400">{titleLine2}</span>
                        </h1>

                        <p className="sm:text-lg animate-fade-slide-in-3 text-base text-slate-300 max-w-2xl mt-8 mx-auto leading-relaxed">
                            {description}
                        </p>

                        {/* Call To Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:gap-5 mt-10 gap-4 items-center justify-center animate-fade-slide-in-4">
                            <a
                                href={primaryButtonHref}
                                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-base font-semibold text-white rounded-full py-3.5 px-8 transition-colors shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                            >
                                {primaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href={secondaryButtonHref}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 ring-1 ring-white/20 backdrop-blur-md px-8 py-3.5 text-base font-medium text-white transition-colors w-full sm:w-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {secondaryButtonText}
                            </a>
                        </div>
                    </div>

                    {/* Data Stats Strip */}
                    <div className="mx-auto mt-24 max-w-5xl animate-fade-slide-in-4">
                        <div className="border-t border-white/10 pt-8">
                            <p className="text-sm font-medium text-slate-400 text-center uppercase tracking-wider mb-8">
                                {statsTitle}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                                {stats?.map((stat, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                                        <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketCompassHero;
