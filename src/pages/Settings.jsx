import { Settings as SettingsIcon, Bell, Palette, Shield, Globe } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Settings</h1>
                <p className="text-sm text-[var(--color-text-muted)]">Manage your kitchen dashboard preferences and configurations.</p>
            </div>

            {[
                { icon: Bell, title: 'Notifications', desc: 'Configure alerts for orders, inventory thresholds, and staff updates.' },
                { icon: Palette, title: 'Theme & Display', desc: 'Customize the dashboard appearance — colors, density, and layout.' },
                { icon: Shield, title: 'Permissions', desc: 'Manage access control for chefs, sous chefs, and kitchen staff.' },
                { icon: Globe, title: 'Integration', desc: 'Connect with POS systems, delivery platforms, and suppliers.' },
            ].map((item, i) => {
                const Icon = item.icon;
                return (
                    <div key={i} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex items-start gap-4 hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[var(--color-text-main)]">{item.title}</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
