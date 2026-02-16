export default function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="footer__grid">
                <div className="footer__brand">
                    <div className="navbar__logo" style={{ marginBottom: 0 }}>
                        <img src="/logo.png" alt="Crave House" className="navbar__logo-img" />
                        <div className="navbar__logo-text">
                            <span className="navbar__logo-name" style={{ color: 'white' }}>Crave House</span>
                            <span className="navbar__logo-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>Premium Dining Experience</span>
                        </div>
                    </div>
                    <p>
                        Revolutionizing restaurant management with cutting-edge technology and exceptional service.
                    </p>
                    <div className="footer__socials">
                        <a href="#" className="footer__social-link">f</a>
                        <a href="#" className="footer__social-link">𝕏</a>
                        <a href="#" className="footer__social-link">in</a>
                    </div>
                </div>

                <div>
                    <h4 className="footer__col-title">Quick Links</h4>
                    <ul className="footer__links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#steps">How It Works</a></li>
                        <li><a href="#testimonials">Testimonials</a></li>
                        <li><a href="#experience">Get Started</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer__col-title">Contact</h4>
                    <ul className="footer__links">
                        <li><a href="mailto:support@cravehouse.com">support@cravehouse.com</a></li>
                        <li><a href="tel:+94752287838">+94 75 228 78 38</a></li>
                        <li><a href="#">123 Restaurant St</a></li>
                        <li><a href="#">flower street colombo</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer__bottom">
                <p>© 2026 Crave House. All rights reserved.</p>
                <div className="footer__bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}
