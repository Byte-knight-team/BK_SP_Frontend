export default function SectionHeader({ title, description, Icon }) {
    return (
      <div className="mb-6">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="mt-1 text-orange-500">
              <Icon size={22} />
            </div>
          )}
  
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }