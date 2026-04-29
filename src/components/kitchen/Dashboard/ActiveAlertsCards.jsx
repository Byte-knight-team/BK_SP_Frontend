import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { resolveAlertAPI } from "../../../apis/kitchen/alerts";
import { toast } from "react-toastify";

const ActiveAlertsCard = ({ alerts, onRefresh }) => {
  
  const handleResolve = async (id) => {
    const { error } = await resolveAlertAPI(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Issue marked as Resolved!");
      onRefresh(); // Refresh the list automatically
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-50 h-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Operational Alerts</h2>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600 uppercase tracking-wider">
          {alerts.length} ACTIVE
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-300">
            <CheckCircle size={40} className="mb-2 opacity-20" />
            <p className="text-xs font-medium italic">All equipment normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="group relative flex items-start gap-3 rounded-2xl border border-gray-50 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-md">
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full animate-pulse ${
                alert.type === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-400'
              }`} />
              
              <div className="flex-1">
                <p className="text-[13px] font-medium leading-relaxed text-gray-700">
                  {alert.message}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <Clock size={12} />
                  {alert.timeAgo} ago
                </div>
              </div>

              <button 
                onClick={() => handleResolve(alert.id)}
                className="hidden group-hover:flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:scale-105"
              >
                <CheckCircle size={12} /> FIXED
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveAlertsCard;
