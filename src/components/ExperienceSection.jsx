import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';

export default function ExperienceSection() {
    return (
        <section className="bg-slate-100 px-4 py-20 sm:px-6" id="experience">
            <div className="mx-auto max-w-5xl">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Get Started</p>
                    <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">Choose Your Experience</h2>
                    <p className="mt-4 text-slate-600">Select the option that best fits your needs</p>
                </div>

                <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/10 sm:p-10">
                    <div className="mx-auto mb-5 inline-flex rounded-2xl bg-orange-100 p-4 text-orange-700">
                        <Store size={30} />
                    </div>
                    <h3 className="text-4xl font-bold text-slate-900">Customer</h3>
                    <p className="mx-auto mt-3 max-w-xl text-slate-600">
                        Discover dishes, customize your meal, and manage every order from one clean interface.
                    </p>
                    <Link
                        to="/menu"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-orange-600"
                    >
                        Start ordering
                        <ArrowRight size={18} />
                    </Link>
                </article>
            </div>
        </section>
    );
}
