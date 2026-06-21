import { BellRing, ClipboardList, CreditCard, ScanLine, ShoppingCart, Store, Truck, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const FLOW_SECTIONS = Object.freeze({
  restaurant: {
    id: 'restuarent',
    eyebrow: 'In-Restaurant Flow',
    title: 'QR Ordering Steps Inside the Restaurant',
    description: 'A clear step-by-step table ordering process designed for speed, accuracy, and low staff load.',
    items: [
      { title: 'Scan Table QR', description: 'Guest scans the table QR code to open the restaurant menu instantly.', icon: ScanLine },
      { title: 'Select Items', description: 'Guest customizes dishes, adds notes, and reviews the order before checkout.', icon: ClipboardList },
      { title: 'Pay Securely', description: 'Order is confirmed via secure in-app payment or pay-at-counter options.', icon: CreditCard },
      { title: 'Receive Updates', description: 'Kitchen progress and order-ready notifications are shown in real time.', icon: BellRing },
    ],
  },
  online: {
    id: 'online',
    eyebrow: 'Online Ordering Flow',
    title: 'How Online Customer Orders Are Processed',
    description: 'Professional end-to-end flow for customers ordering remotely.',
    items: [
      { title: 'Discover Restaurant', description: 'Customer opens the app, checks menu categories, and views item details.', icon: Store },
      { title: 'Add to Cart', description: 'Select items, customize preferences, and confirm delivery location.', icon: ShoppingCart },
      { title: 'Checkout & Payment', description: 'Complete secure payment with cards or digital wallets in seconds.', icon: Wallet },
      { title: 'Track Delivery', description: 'Customer tracks preparation and rider status until the order arrives.', icon: Truck },
    ],
  },
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function FlowSection({ flowKey }) {
  const section = FLOW_SECTIONS[flowKey] ?? FLOW_SECTIONS.restaurant;

  return (
    <section id={section.id} className="bg-slate-100 px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div 
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {section.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{section.title}</h2>
          <p className="mt-4 text-slate-600">{section.description}</p>
        </motion.div>

        <motion.div 
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {section.items.map((item, index) => {
            return (
              <motion.article 
                key={item.title} 
                variants={itemVariants}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-slate-300"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform duration-300 group-hover:scale-110">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-slate-400">STEP {index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{item.description}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}