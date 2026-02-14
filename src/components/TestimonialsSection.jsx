export default function TestimonialsSection() {
    const testimonials = [
        {
            text: "The QR ordering system is genius! No more waiting for servers. Food arrived quickly and the loyalty program is amazing.",
            name: "Dilini Perera",
            role: "Food Blogger",
            initials: "DP"
        },
        {
            text: "Best restaurant app I've used. Real-time tracking is so convenient, and I love earning rewards with every order.",
            name: "Nuwan Pradeep",
            role: "Regular Customer",
            initials: "NP"
        },
        {
            text: "As a manager, this system has streamlined our operations. Kitchen efficiency is up 40% and customer satisfaction has soared.",
            name: "Chamari Silva",
            role: "Restaurant Manager",
            initials: "CS"
        }
    ];

    return (
        <section className="testimonials-section" id="testimonials">
            <div className="section__header">
                <div className="section__badge badge--orange" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFD700', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: 6 }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Customer Reviews
                </div>
                <h2 className="section__title" style={{ color: '#fff' }}>Loved by Thousands</h2>
                <p className="section__subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    See what our customers are saying about their experience
                </p>
            </div>

            <div className="testimonials__grid">
                {testimonials.map((t, i) => (
                    <div className="testimonial-card" key={i}>
                        <div className="testimonial-card__stars">★★★★★</div>
                        <p className="testimonial-card__text">"{t.text}"</p>
                        <div className="testimonial-card__author">
                            <div className="testimonial-card__avatar"></div>
                            <div className="testimonial-card__info">
                                <h4>{t.name}</h4>
                                <p>{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
