import qrLogo from '../assets/QR Logo.png';

export default function HeroSection() {
    return (
        <section className="hero" id="home">
            <div
                className="hero__bg"
                style={{ backgroundImage: `url('https://www.paytronix.com/hubfs/restaurant%20decor%20ideas.jpg')` }}
            />

            <div className="hero__inner">
                <div className="hero__content">
                    <div className="hero__badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Award-Winning Restaurant Management
                    </div>

                    <h1 className="hero__title">
                        Elevate Your<br />
                        <span>Dining<br />Experience</span>
                    </h1>

                    <p className="hero__subtitle">
                        Experience seamless QR ordering, real-time tracking,
                        and exclusive rewards. From dine-in to delivery, we
                        redefine restaurant excellence.
                    </p>

                    <div className="hero__buttons">
                        <button className="btn btn--primary btn--primary-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                            Start Ordering
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="hero__right">
                    <div className="hero__image-card">
                        <img
                            src="https://images.unsplash.com/photo-1755811248279-1ab13b7d4384?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8"
                            alt="Delicious Food Collage"
                        />

                        <div className="hero__qr-card">
                            <div className="hero__qr-icon">
                                <img src={qrLogo} alt="QR Code" />
                            </div>
                            <div className="hero__qr-label">Scan & Order</div>
                        </div>

                        <div className="hero__orders-badge">
                            <div className="hero__orders-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                            <div className="hero__orders-info">
                                <h4>+2.4K Orders</h4>
                                <p>This month</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero__stats">
                <div className="hero__stat-card">
                    <div className="hero__stat-value">
                        <span style={{ color: '#FFD700', marginRight: 4 }}>★</span> 4.9
                    </div>
                    <div className="hero__stat-label">App Rating</div>
                </div>
                <div className="hero__stat-card">
                    <div className="hero__stat-value">50K+</div>
                    <div className="hero__stat-label">Orders</div>
                </div>
                <div className="hero__stat-card">
                    <div className="hero__stat-value">24/7</div>
                    <div className="hero__stat-label">Support</div>
                </div>
            </div>
        </section>
    );
}
