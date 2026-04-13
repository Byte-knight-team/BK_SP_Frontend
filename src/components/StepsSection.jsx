import { Store, ShoppingCart, Wallet, Truck } from 'lucide-react';

const ONLINE_ORDERING_STEPS = [
	{
		title: 'Discover Restaurant',
		description: 'Customer opens the app, checks menu categories, and views item details.',
		icon: Store,
	},
	{
		title: 'Add to Cart',
		description: 'Select items, customize preferences, and confirm delivery location.',
		icon: ShoppingCart,
	},
	{
		title: 'Checkout & Payment',
		description: 'Complete secure payment with cards or digital wallets in seconds.',
		icon: Wallet,
	},
	{
		title: 'Track Delivery',
		description: 'Customer tracks preparation and rider status until the order arrives.',
		icon: Truck,
	},
];

export default function StepsSection() {
	return (
		<section id="steps" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<p className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Online Ordering Flow</p>
					<h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">How Online Customer Orders Are Processed</h2>
					<p className="mt-4 text-slate-600">Professional end-to-end flow for customers ordering remotely.</p>
				</div>

				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
					{ONLINE_ORDERING_STEPS.map((step, index) => {
						const Icon = step.icon;
						return (
							<article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
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
