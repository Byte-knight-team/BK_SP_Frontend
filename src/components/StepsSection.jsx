export default function StepsSection() {
    return (
        <section className="section" id="steps">
            <div className="section__header">
                <div className="section__badge badge--blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Simple Process
                </div>
                <h2 className="section__title">Get Started in 3 Easy Steps</h2>
            </div>

            <div className="steps__grid">
                <div className="step-card">
                    <div className="step-card__icon-wrapper">
                        <div className="step-card__icon bg-orange">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                            </svg>
                        </div>
                        <div className="step-card__number">01</div>
                    </div>
                    <h3 className="step-card__title">Scan QR Code</h3>
                    <p className="step-card__desc">
                        Simply scan the QR code at your table or access the menu online
                    </p>
                </div>

                <div className="step-card">
                    <div className="step-card__icon-wrapper">
                        <div className="step-card__icon bg-blue">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <div className="step-card__number">02</div>
                    </div>
                    <h3 className="step-card__title">Browse & Order</h3>
                    <p className="step-card__desc">
                        Explore our menu, customize your order, and checkout securely
                    </p>
                </div>

                <div className="step-card">
                    <div className="step-card__icon-wrapper">
                        <div className="step-card__icon bg-purple">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </div>
                        <div className="step-card__number">03</div>
                    </div>
                    <h3 className="step-card__title">Enjoy & Earn</h3>
                    <p className="step-card__desc">
                        Receive your order and earn loyalty points for future rewards
                    </p>
                </div>
            </div>
        </section>
    );
}
