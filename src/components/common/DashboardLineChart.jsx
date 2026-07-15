import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/*
  DashboardLineChart — a reusable, data-agnostic line chart.

  This owns ONLY the presentation (recharts). Each dashboard fetches its own data
  and passes it in, so the same chart renders receptionist revenue, kitchen peak
  hours, or anything else — no business logic lives here.

  Props:
    data            — array of row objects
    xKey            — field used for the X-axis labels
    series          — [{ dataKey, name, color }] — one <Line> per entry
    yTickFormatter  — formats Y-axis tick labels (defaults to valueFormatter)
    tooltipFormatter— formats tooltip values (defaults to valueFormatter)
    valueFormatter  — base formatter used for both when the specific ones aren't given
    showLegend      — show/hide the legend (default true)
    showXAxis       — show/hide the X-axis labels (default true)
    yWidth          — reserved width for the Y-axis (default 48)

  Sizing: fills its parent (height/width 100%), so wrap it in a sized container
  (e.g. a flex-1 min-h-0 div, or a fixed h-[300px] div).
*/
const DashboardLineChart = ({
  data = [],
  xKey = 'day',
  series = [],
  valueFormatter = (v) => v,
  yTickFormatter,
  tooltipFormatter,
  showLegend = true,
  showXAxis = true,
  yWidth = 48,
}) => {
  const yFmt = yTickFormatter || valueFormatter
  const tipFmt = tooltipFormatter || valueFormatter

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xKey}
            hide={!showXAxis}
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yFmt}
            width={yWidth}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => [tipFmt(value), undefined]}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              fontSize: '12px',
              fontWeight: 600,
            }}
          />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '8px' }}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DashboardLineChart
