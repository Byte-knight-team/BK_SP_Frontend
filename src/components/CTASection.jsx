export default function CTASection() {
    return (
        <section className="cta">
            <div className="cta__content">
                <h2 className="cta__title">
                    Ready to Transform<br />Your Restaurant<br />Experience?
                </h2>
                <p className="cta__subtitle">
                    Join thousands of satisfied customers and restaurant owners who trust Crave House
                </p>
                <button className="btn btn--white btn--white-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    Start Ordering Now
                </button>
            </div>
        </section>
    );
}
