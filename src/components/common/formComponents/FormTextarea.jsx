import { useController } from 'react-hook-form'

export const FormTextarea = ({
  control,
  name,
  label,
  rules,
  rows = 4,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  })

  return (
    <div className="flex w-full flex-col gap-1 text-left">
      {label && (
        <label
          className={`ml-1 text-xs font-bold tracking-wider uppercase transition-colors ${
            error ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {label}
        </label>
      )}

      <textarea
        {...field}
        {...props}
        rows={rows}
        className={`w-full resize-none rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-700 transition-all outline-none focus:ring-2 ${
          error
            ? 'border border-red-500 focus:ring-red-500/20'
            : 'border-none focus:ring-orange-500/20'
        }`}
      />

      {error && (
        <p className="mt-0.5 ml-2 text-[10px] font-bold tracking-tight text-red-500 uppercase">
          {error.message}
        </p>
      )}
    </div>
  )
}
