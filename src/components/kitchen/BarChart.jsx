'use client'

import React from 'react'
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Helper for deep equality check
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  )
    return false
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false
  }
  return true
}

// Simple CX utility if not using a separate util file
const cx = (...classes) => classes.filter(Boolean).join(' ')

// Dummy color mapping if your lib/chartUtils isn't available
const getColorClassName = (color, type) => {
  const colors = {
    blue: { fill: 'fill-blue-500', bg: 'bg-blue-500', hex: '#3b82f6' },
    orange: { fill: 'fill-[#E64919]', bg: 'bg-[#E64919]', hex: '#E64919' },
    emerald: { fill: 'fill-emerald-500', bg: 'bg-emerald-500', hex: '#10b981' },
  }
  return (
    colors[color]?.[type] ||
    (type === 'fill'
      ? 'fill-gray-500'
      : type === 'hex'
        ? '#6b7280'
        : 'bg-gray-500')
  )
}

const renderShape = (props, activeBar, activeLegend, layout) => {
  const { fillOpacity, name, payload, value } = props
  let { x, width, y, height } = props

  if (layout === 'horizontal' && height < 0) {
    y += height
    height = Math.abs(height)
  } else if (layout === 'vertical' && width < 0) {
    x += width
    width = Math.abs(width)
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={5}
      ry={5}
      opacity={
        activeBar || (activeLegend && activeLegend !== name)
          ? deepEqual(activeBar, { ...payload, value })
            ? fillOpacity
            : 0.3
          : fillOpacity
      }
    />
  )
}

const LegendItem = ({ name, color, onClick, activeLegend }) => {
  const hasOnValueChange = !!onClick
  return (
    <li
      className={cx(
        'group inline-flex flex-nowrap items-center gap-1.5 rounded-sm px-2 py-1 whitespace-nowrap transition',
        hasOnValueChange
          ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'cursor-default',
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(name, color)
      }}
    >
      <span
        className={cx(
          'size-2 shrink-0 rounded-xs',
          getColorClassName(color, 'bg'),
          activeLegend && activeLegend !== name ? 'opacity-40' : 'opacity-100',
        )}
        aria-hidden={true}
      />
      <p
        className={cx(
          'truncate text-xs whitespace-nowrap text-gray-700 dark:text-gray-300',
          hasOnValueChange &&
            'group-hover:text-gray-900 dark:group-hover:text-gray-50',
          activeLegend && activeLegend !== name ? 'opacity-40' : 'opacity-100',
        )}
      >
        {name}
      </p>
    </li>
  )
}

const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-gray-200 bg-white text-sm shadow-md dark:border-gray-800 dark:bg-gray-950">
        {/* This is the Title (e.g., 8AM-10AM) */}
        <div className="border-b border-inherit px-4 py-2">
          <p className="font-medium text-gray-900 dark:text-gray-50">{label}</p>
        </div>
        {/* This is the Data list (e.g., mealsCount 2) */}
        <div className="space-y-1 px-4 py-2">
          {payload.map(({ value, category, color }, index) => (
            <div
              key={`id-${index}`}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={cx(
                    'size-2 shrink-0 rounded-xs',
                    getColorClassName(color, 'bg'),
                  )}
                />
                <p className="text-right whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {category}
                </p>
              </div>
              <p className="text-right font-medium whitespace-nowrap text-gray-900 tabular-nums dark:text-gray-50">
                {valueFormatter(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

const BarChart = React.forwardRef((props, forwardedRef) => {
  const {
    data = [],
    categories = [],
    index,
    colors = ['blue'],
    valueFormatter = (value) => value.toString(),
    showXAxis = true,
    showYAxis = true,
    showGridLines = true,
    yAxisWidth = 30,
    showTooltip = true,
    showLegend = true,
    className,
    onValueChange,
    layout = 'horizontal',
    type = 'default',
    xAxisLabel,
    yAxisLabel,
    barCategoryGap,
    ...other
  } = props

  const [activeLegend, setActiveLegend] = React.useState(undefined)
  const [activeBar, setActiveBar] = React.useState(undefined)
  const stacked = type === 'stacked' || type === 'percent'

  // Simple category to color mapping
  const categoryColors = new Map(
    categories.map((cat, i) => [cat, colors[i % colors.length]]),
  )

  function onBarClick(data, _, event) {
    event.stopPropagation()
    if (!onValueChange) return
    if (deepEqual(activeBar, { ...data.payload, value: data.value })) {
      setActiveLegend(undefined)
      setActiveBar(undefined)
      onValueChange?.(null)
    } else {
      setActiveLegend(data.tooltipPayload?.[0]?.dataKey)
      setActiveBar({ ...data.payload, value: data.value })
      onValueChange?.({
        eventType: 'bar',
        categoryClicked: data.tooltipPayload?.[0]?.dataKey,
        ...data.payload,
      })
    }
  }

  return (
    <div
      ref={forwardedRef}
      className={cx(className ? className : 'h-56', 'w-full')}
      {...other}
    >
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
          layout={layout}
          barCategoryGap={barCategoryGap}
          stackOffset={type === 'percent' ? 'expand' : undefined}
          margin={{
            bottom: xAxisLabel ? 30 : 20,
            left: yAxisLabel ? 20 : 10,
            right: 10,
            top: 10,
          }}
        >
          {showGridLines && (
            <CartesianGrid
              className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
              horizontal={layout !== 'vertical'}
              vertical={layout === 'vertical'}
            />
          )}
          <XAxis
            hide={!showXAxis}
            dataKey={layout === 'horizontal' ? index : undefined}
            type={layout === 'vertical' ? 'number' : 'category'}
            tickLine={false}
            axisLine={false}
            className="fill-gray-500 text-[9px]"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={65}
            dy={10}
          >
            {xAxisLabel && (
              <Label
                position="insideBottom"
                offset={-20}
                className="fill-gray-800 font-medium"
              >
                {xAxisLabel}
              </Label>
            )}
          </XAxis>
          <YAxis
            width={yAxisWidth}
            hide={!showYAxis}
            dataKey={layout === 'vertical' ? index : undefined}
            type={layout === 'horizontal' ? 'number' : 'category'}
            tickLine={false}
            axisLine={false}
            className="fill-gray-500 text-[8px]"
            tickFormatter={
              type === 'percent'
                ? (v) => `${(v * 100).toFixed(0)}%`
                : valueFormatter
            }
            allowDecimals={false} // prevent 1.5, 2.5 etc.
            tickCount={6} // control how many numbers show up
          >
            {yAxisLabel && (
              <Label
                position="insideLeft"
                angle={-90}
                offset={-15}
                style={{ textAnchor: 'middle' }}
                className="fill-gray-800 font-medium"
              >
                {yAxisLabel}
              </Label>
            )}
          </YAxis>
          <Tooltip
            cursor={{ fill: '#d1d5db', opacity: '0.15' }}
            content={({ active, payload, label }) =>
              showTooltip && active ? (
                <ChartTooltip
                  active={active}
                  payload={payload?.map((p) => ({
                    category: p.dataKey,
                    value: p.value,
                    color: categoryColors.get(p.dataKey),
                  }))}
                  label={label}
                  valueFormatter={valueFormatter}
                />
              ) : null
            }
          />
          {showLegend && <RechartsLegend verticalAlign="top" height={40} />}
          {categories.map((category) => (
            <Bar
              key={category}
              name={category}
              dataKey={category}
              stackId={stacked ? 'stack' : undefined}
              fill={getColorClassName(categoryColors.get(category), 'hex')}
              className={cx(
                getColorClassName(categoryColors.get(category), 'fill'),
                onValueChange ? 'cursor-pointer' : '',
              )}
              shape={(p) => renderShape(p, activeBar, activeLegend, layout)}
              onClick={onBarClick}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
})

BarChart.displayName = 'BarChart'

export { BarChart }
