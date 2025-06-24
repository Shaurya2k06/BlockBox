import React from 'react';
import Hero from "./components/hero.jsx";

function LandingPage({ onNavigate }) {
    return (
        <div>
            <Hero onNavigate={onNavigate} />

        </div>
    );
}

export default LandingPage;