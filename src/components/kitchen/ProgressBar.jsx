import React from "react";

const ProgressBar = ({ percentage, color }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2"> 
  <div 
    className="h-2 rounded-full" 
    style={{ width: `${percentage}%`, backgroundColor: color }} //need color as Hex value
  ></div>
</div>
  );
};

export default ProgressBar;


