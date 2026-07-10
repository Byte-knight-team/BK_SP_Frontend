import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

// Reusable premium dropdown (Headless UI Listbox) — options: [{ value, label }]
const PremiumSelect = ({ value, onChange, options, placeholder = 'Select', disabled = false, compact = false }) => {
  const selected = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <ListboxButton
          className={`flex w-full items-center justify-between rounded-2xl bg-gray-50 text-left font-medium outline-none transition-all focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
          }`}
        >
          <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={compact ? 15 : 18} className="shrink-0 text-gray-400" />
        </ListboxButton>
        <ListboxOptions
          transition
          anchor="bottom start"
          className="z-[60] max-h-60 w-[var(--button-width)] overflow-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-300/40 outline-none transition duration-150 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {options.map((o) => (
            <ListboxOption
              key={o.value}
              value={o.value}
              className={`group flex cursor-pointer items-center justify-between rounded-xl transition-colors data-[focus]:bg-orange-50 data-[selected]:bg-orange-50 ${
                compact ? 'px-3 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'
              }`}
            >
              <span className="font-medium text-gray-700 group-data-[selected]:font-bold group-data-[selected]:text-orange-600">
                {o.label}
              </span>
              <Check size={16} className="shrink-0 text-orange-500 opacity-0 group-data-[selected]:opacity-100" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}

export default PremiumSelect
