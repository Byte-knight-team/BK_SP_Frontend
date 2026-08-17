import { X, Save, Loader2 } from 'lucide-react';

export default function EditableSection({
  icon,
  label,
  value,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  fieldName,
  formValue,
  onChange,
  type = 'text',
  isTextarea = false,
}) {
  return (
    <div className="px-6 py-4 transition-colors hover:bg-slate-50/50">
      {!isEditing ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 border border-slate-200/60 shadow-xs">
              {icon}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-900 leading-normal">{value}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 active:scale-95"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3.5 rounded-2xl bg-orange-50/40 p-4 border border-orange-200/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              {icon}
            </div>
            <p className="text-xs font-bold text-orange-950 uppercase tracking-wider">{label}</p>
          </div>
          {isTextarea ? (
            <textarea
              name={fieldName}
              value={formValue || ''}
              onChange={onChange}
              rows="3"
              className="w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-100 placeholder:text-slate-400 shadow-xs"
            />
          ) : (
            <input
              type={type}
              name={fieldName}
              value={formValue || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-100 placeholder:text-slate-400 shadow-xs"
            />
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={13} /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}