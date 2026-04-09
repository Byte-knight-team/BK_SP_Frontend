import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="bg-orange-500 px-4 py-20 text-center sm:px-6">
            <div className="mx-auto max-w-3xl">
                <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
                    Ready to Transform
                    <br />
                    Your Restaurant
                    <br />
                    Experience?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-orange-100">
                    Join thousands of satisfied customers and restaurant owners who trust Crave House
                </p>
                <Link
                    to="/menu"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-orange-600 shadow-xl shadow-orange-700/30 transition-transform hover:-translate-y-0.5"
                >
                    Start Ordering Now
                    <ArrowRight size={18} />
                </Link>
            </div>
        </section>
    );
}
