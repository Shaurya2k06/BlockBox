import React from 'react';
import About from "./components/about.jsx";

import Hero from "./components/hero.jsx";

function LandingPage({ onNavigate }) {
    return (
        <div>
            <Hero onNavigate={onNavigate} />

        </div>
    );
}

export default LandingPage;