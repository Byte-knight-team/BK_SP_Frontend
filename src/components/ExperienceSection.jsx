export default function ExperienceSection() {
    return (
        <section className="section" id="experience">
            <div className="section__header">
                <div className="section__badge badge--orange">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Get Started
                </div>
                <h2 className="section__title">Choose Your Experience</h2>
                <p className="section__subtitle">
                    Select the option that best fits your needs
                </p>
            </div>

            <div className="experience__card">
                <div className="experience__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Customer</h3>
                <p style={{ color: 'var(--gray-500)', maxWidth: 500, margin: '0 auto 32px' }}>
                    Order delicious food, track your delivery in real-time, and earn exclusive rewards with every purchase
                </p>
                <a href="#" style={{ color: 'var(--orange)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    Start Ordering
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
