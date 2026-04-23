const SectionHeader = ({ title, description, Icon }) => {
  return (
    <div className="flex items-center gap-5 mb-10">
      <div className="p-4 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm">
        <Icon size={32} color="#E64919" />
      </div>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};

export default SectionHeader;
