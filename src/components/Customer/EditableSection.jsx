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
    <div className="px-6 py-4">
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 truncate text-sm text-slate-900 leading-relaxed">{value}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="ml-3 flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
              <span className="text-orange-500">{icon}</span>
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
          {isTextarea ? (
            <textarea
              name={fieldName}
              value={formValue || ''}
              onChange={onChange}
              rows="3"
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          ) : (
            <input
              type={type}
              name={fieldName}
              value={formValue || ''}
              onChange={onChange}
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}