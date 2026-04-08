import { ScanLine, ClipboardList, CreditCard, BellRing } from 'lucide-react';

const QR_ORDERING_STEPS = [
    {
        title: 'Scan Table QR',
        description: 'Guest scans the table QR code to open the restaurant menu instantly.',
        icon: ScanLine,
    },
    {
        title: 'Select Items',
        description: 'Guest customizes dishes, adds notes, and reviews the order before checkout.',
        icon: ClipboardList,
    },
    {
        title: 'Pay Securely',
        description: 'Order is confirmed via secure in-app payment or pay-at-counter options.',
        icon: CreditCard,
    },
    {
        title: 'Receive Updates',
        description: 'Kitchen progress and order-ready notifications are shown in real time.',
        icon: BellRing,
    },
];

export default function FeaturesSection() {
    return (
        <section className="w-full bg-slate-100 px-4 py-20 sm:px-6 lg:px-8" id="features">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        In-Restaurant Flow
                    </p>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                        QR Ordering Steps Inside the Restaurant
                    </h2>
                    <p className="mt-4 text-slate-600">
                        A clear step-by-step table ordering process designed for speed, accuracy, and low staff load.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {QR_ORDERING_STEPS.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-xs font-semibold tracking-wider text-slate-400">STEP {index + 1}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="mt-2 leading-relaxed text-slate-600">{step.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
