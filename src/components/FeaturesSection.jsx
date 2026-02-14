export default function FeaturesSection() {
    return (
        <section className="section" id="features">
            <div className="section__header">
                <div className="section__badge badge--orange">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Powerful Features
                </div>
                <h2 className="section__title">Everything You Need in One Platform</h2>
                <p className="section__subtitle">
                    Built for modern restaurants with cutting-edge technology
                </p>
            </div>

            <div className="features__grid">
                <div className="feature-card feature-card--orange">
                    <div className="feature-card__icon bg-orange">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </div>
                    <h3 className="feature-card__title">QR Code Ordering</h3>
                    <p className="feature-card__desc">
                        Contactless menu browsing and ordering. Scan, order, and pay—all from your phone.
                    </p>
                </div>

                <div className="feature-card feature-card--blue">
                    <div className="feature-card__icon bg-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 14 8 14s8-8.6 8-14a8 8 0 0 0-8-8z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <h3 className="feature-card__title">Live GPS Tracking</h3>
                    <p className="feature-card__desc">
                        Real-time delivery tracking with driver location and precise ETA updates.
                    </p>
                </div>

                <div className="feature-card feature-card--purple">
                    <div className="feature-card__icon bg-purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                    <h3 className="feature-card__title">Loyalty Program</h3>
                    <p className="feature-card__desc">
                        Earn points, unlock tiers, and redeem exclusive rewards with every order.
                    </p>
                </div>
            </div>
        </section>
    );
}
