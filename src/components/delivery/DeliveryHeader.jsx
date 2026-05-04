import { useState, useEffect } from "react";
import craveHouseLogo from "../../assets/Crave House logo.png";
import { authFetch } from "../../apis/apiHelper";

export default function DeliveryHeader({ branchName }) {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authFetch("http://localhost:8080/api/delivery/status");
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const oldStatus = isOnline;
    const newStatus = !isOnline;

    // Optimistic update
    setIsOnline(newStatus);

    try {
      const response = await authFetch("http://localhost:8080/api/delivery/status/toggle", {
        method: "POST",
        body: JSON.stringify({ isOnline: newStatus }),
      });
      if (!response.ok) {
        // Revert on failure
        setIsOnline(oldStatus);
        console.error("Failed to toggle status");
      }
    } catch (error) {
      // Revert on error
      setIsOnline(oldStatus);
      console.error("Failed to toggle status:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img
          src={craveHouseLogo}
          alt="Crave House"
          className="h-9 w-9 object-contain"
        />
        <div>
          <h1 className="text-sm font-black tracking-tight leading-none">
            CRAVE<span className="text-orange-500">HOUSE</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {branchName || "Assigned Branch"}
          </p>
        </div>
      </div>

      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isOnline ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isOnline ? "translate-x-7" : "translate-x-0"
          } flex items-center justify-center`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center pointer-events-none text-[8px] font-black uppercase tracking-tighter ${
            isOnline ? "pr-7 text-white" : "pl-7 text-gray-500"
          }`}
        >
          {isOnline ? "ON" : "OFF"}
        </span>
      </button>
    </header>
  );
}