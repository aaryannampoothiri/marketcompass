import React from "react";
import MarketCompassHero from "./market-compass-hero";

const HeroDemo = () => {
    return (
        <MarketCompassHero
            logoText="Market Compass"
            badgeLabel="Data-Driven"
            badgeText="Explore Business Opportunities Across Urban Corridors"
            title="Find the Right Business."
            titleLine2="In the Right Place."
            description="Market Compass connects business ideas, audiences, timing, and locations to help you discover where opportunities make sense."
            primaryButtonText="I Have a Business Idea"
            primaryButtonHref="#find-place"
            secondaryButtonText="I Have a Place"
            secondaryButtonHref="#find-business"
            ctaButtonText="Explore Opportunities"
            ctaButtonHref="#explore"
            navLinks={[
                { label: "Home", href: "#", isActive: true },
                { label: "Find a Business", href: "#find-business" },
                { label: "Find a Location", href: "#find-place" },
                { label: "Methodology", href: "#methodology" }
            ]}
            statsTitle="Powered by real urban location intelligence"
            stats={[
                { value: "2", label: "Cities" },
                { value: "100+", label: "Corridors" },
                { value: "48", label: "Audience Segments" },
                { value: "24", label: "Business Archetypes" },
                { value: "500+", label: "Mapped Places" }
            ]}
        />
    );
};

export default HeroDemo;
