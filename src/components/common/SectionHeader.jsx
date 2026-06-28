export default function SectionHeader({ title, description, Icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Icon size={20} />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1.5 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}