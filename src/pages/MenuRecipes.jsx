import { useState } from 'react';
import {
    BookOpen,
    X,
    Plus,
    Trash2,
    ChevronRight,
    Save,
    Send,
    Check,
} from 'lucide-react';
import { menuItems as initialMenu } from '../data/mockData';

const statusStyles = {
    approved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Approved' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
    draft: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Draft' },
};

export default function MenuRecipes() {
    const [menuList, setMenuList] = useState(initialMenu);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editData, setEditData] = useState(null);
    const [successToast, setSuccessToast] = useState('');

    const showToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3000);
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setEditData({
            ...item,
            ingredients: item.ingredients.map(i => ({ ...i })),
        });
    };

    const handleIngredientChange = (index, field, value) => {
        setEditData(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
    };

    const handleAddIngredient = () => {
        setEditData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', qty: 0, unit: 'g' }],
        }));
    };

    const handleRemoveIngredient = (index) => {
        setEditData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index),
        }));
    };

    const handleSubmitForApproval = () => {
        setMenuList(prev => prev.map(i =>
            i.id === editData.id ? { ...editData, status: 'pending' } : i
        ));
        showToast('Changes submitted for admin approval');
        setSelectedItem(null);
        setEditData(null);
    };

    const handleSaveDraft = () => {
        setMenuList(prev => prev.map(i =>
            i.id === editData.id ? { ...editData, status: 'draft' } : i
        ));
        showToast('Draft saved');
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
            {/* Header */}
            <div className="mb-5">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Management &gt; Menu & Recipes</p>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Recipe Library</h1>
                <p className="text-sm text-[var(--color-text-muted)]">Manage ingredients and costing for your active menu items.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 min-h-0">
                {/* Left: Menu List */}
                <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[var(--color-bg-light)]">
                                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Item Name</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Category</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Price</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                                    <th className="px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuList.map(item => {
                                    const style = statusStyles[item.status] || statusStyles.approved;
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleSelectItem(item)}
                                            className={`border-t border-[var(--color-border)] cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-orange-50' : 'hover:bg-slate-50/50'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{item.image}</span>
                                                    <span className="font-semibold text-[var(--color-text-main)]">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[var(--color-text-muted)]">{item.category}</td>
                                            <td className="px-4 py-4 text-center font-bold text-[var(--color-text-main)]">${item.price.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                                                    {style.label}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4">
                                                <ChevronRight className="w-4 h-4 text-[var(--color-text-light)]" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Edit Drawer */}
                {editData ? (
                    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-y-auto animate-slide-in flex flex-col">
                        <div className="p-5 border-b border-[var(--color-border)] flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{editData.image}</span>
                                <div>
                                    <h3 className="font-bold text-[var(--color-text-main)]">Edit Recipe: {editData.name}</h3>
                                    <p className="text-xs text-[var(--color-text-muted)]">Category: {editData.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {editData.status === 'pending' && (
                                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">In Revision</span>
                                )}
                                <button onClick={() => { setSelectedItem(null); setEditData(null); }} className="p-1 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto space-y-5">
                            {/* Ingredient Mapping */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Ingredient Mapping</p>
                                    <button onClick={handleAddIngredient} className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                                        <Plus className="w-3 h-3" /> Add New
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {editData.ingredients.map((ing, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-[var(--color-bg-light)] rounded-xl">
                                            <div className="w-1 h-8 bg-[var(--color-primary)] rounded-full" />
                                            <div className="flex-1 grid grid-cols-[1fr_80px_40px] gap-2 items-center">
                                                <div>
                                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-0.5">Ingredient</p>
                                                    <input
                                                        value={ing.name}
                                                        onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                                                        className="w-full text-sm font-medium bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-0.5">Quantity</p>
                                                    <input
                                                        type="number"
                                                        value={ing.qty}
                                                        onChange={e => handleIngredientChange(i, 'qty', parseFloat(e.target.value) || 0)}
                                                        className="w-full text-sm font-bold bg-transparent focus:outline-none text-right"
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--color-primary)] font-medium text-right">{ing.unit}</span>
                                            </div>
                                            <button onClick={() => handleRemoveIngredient(i)} className="p-1 text-red-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preparation Steps */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">Preparation Steps</p>
                                <textarea
                                    value={editData.prepSteps}
                                    onChange={e => setEditData({ ...editData, prepSteps: e.target.value })}
                                    className="w-full p-3 border border-[var(--color-border)] rounded-xl text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </div>

                            {/* Plate Cost */}
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold text-[var(--color-primary)]">Plate Cost Calculation</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)]">Auto-updated</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">TOTAL COST</p>
                                        <p className="text-xl font-bold text-[var(--color-text-main)]">${editData.totalCost.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">FOOD COST %</p>
                                        <p className="text-xl font-bold text-[var(--color-primary)]">{editData.foodCostPercent}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 border-t border-[var(--color-border)] space-y-2">
                            <button
                                onClick={handleSubmitForApproval}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors"
                            >
                                <Send className="w-4 h-4" /> Submit for Approval
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                className="w-full text-center text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors py-2"
                            >
                                Save as Draft
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-[var(--color-border)] flex items-center justify-center">
                        <div className="text-center text-[var(--color-text-muted)]">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="font-medium">Select a menu item to edit</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successToast}
                </div>
            )}
        </div>
    );
}
