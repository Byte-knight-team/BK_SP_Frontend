import PremiumSelect from './PremiumSelect'

const HOURS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
// minutes in 5-minute steps: 00, 05, 10 … 55
const MINUTES = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5
  return { value: m, label: String(m).padStart(2, '0') }
})
const MERIDIEM = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
]

// "HH:MM" (24h) -> { hour(1-12), minute, meridiem }
const parse = (str) => {
  if (!str) return { hour: 12, minute: 0, meridiem: 'AM' }
  const [h, m] = str.split(':').map(Number)
  return {
    hour: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    meridiem: h < 12 ? 'AM' : 'PM',
  }
}

// { hour(1-12), minute, meridiem } -> "HH:MM" (24h)
const to24 = (hour12, minute, meridiem) => {
  let h = hour12 % 12
  if (meridiem === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// value: "HH:MM" 24h string · onChange(nextStr)
const TimePicker = ({ value, onChange }) => {
  const { hour, minute, meridiem } = parse(value)

  const update = (part, v) => {
    const next = { hour, minute, meridiem, [part]: v }
    onChange(to24(next.hour, next.minute, next.meridiem))
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <PremiumSelect compact value={hour} onChange={(v) => update('hour', v)} options={HOURS} />
      <PremiumSelect compact value={minute} onChange={(v) => update('minute', v)} options={MINUTES} />
      <PremiumSelect compact value={meridiem} onChange={(v) => update('meridiem', v)} options={MERIDIEM} />
    </div>
  )
}

export default TimePicker
