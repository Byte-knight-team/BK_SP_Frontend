import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
            <a href="#" className="navbar__logo">
                <img src="/logo.png" alt="Crave House" className="navbar__logo-img" />
                <div className="navbar__logo-text">
                    <span className="navbar__logo-name">Crave House</span>
                    <span className="navbar__logo-sub">Premium Dining Experience</span>
                </div>
            </a>

            <div className="navbar__links">
                <a href="#features">Features</a>
                <a href="#steps">How It Works</a>
                <a href="#testimonials">Testimonials</a>
                <a href="#experience">Get Started</a>
            </div>

            <div className="navbar__actions">
                <button className="btn btn--primary">Order Now</button>
            </div>
        </nav>
    );
}
