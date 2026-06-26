import React from 'react'

const ProgressBar = ({ percentage, color }) => {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }} //need color as Hex value. because this is inline css using style
      ></div>
    </div>
  )
}

export default ProgressBar
