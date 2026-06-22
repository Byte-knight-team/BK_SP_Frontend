import { useState, useEffect } from "react";

export default function ProfileHeader({ name }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-orange-500 to-orange-600 rounded-4xl p-8 text-white shadow-xl shadow-orange-200">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black opacity-5 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-sm font-medium opacity-80 uppercase tracking-[0.2em] mb-2">
          {formatDate(currentTime)}
        </p>
        
        <h2 className="text-5xl font-black tracking-tighter mb-4">
          {formatTime(currentTime).split(" ")[0]}
          <span className="text-2xl ml-1 opacity-80">
            {formatTime(currentTime).split(" ")[1]}
          </span>
        </h2>

        <div className="h-px w-12 bg-white/30 mb-4"></div>

        <h3 className="text-xl font-bold">
          Hello, <span className="text-orange-100">{name || "Driver"}</span>!
        </h3>
        <p className="text-xs opacity-70 mt-1">Ready for your next delivery?</p>
      </div>
    </div>
  );
}
