export default function SectionHeader({ title, description, Icon }) {
  return (
    <div className="mb-3">
      <div className="flex items-start gap-2.5">
        {Icon && (
          <div className="mt-0.5 text-orange-500">
            <Icon size={18} />
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>

          {description && (
            <p className="mt-0.5 text-[13px] text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}