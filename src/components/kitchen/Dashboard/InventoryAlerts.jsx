import KitchenStatBar from "../KitchenStatBar";
import { useState, useEffect } from "react";
import { PackageX } from "lucide-react";
import { getInventoryAlertsAPI } from "../../../apis/kitchen/dashboard";
import { toast } from "react-toastify";

// BAR_COLORS Object
const BAR_COLORS = {
  LOW: "#F59E0B",
  CRITICAL: "#EF4444",
};

//to convert the data from the API to the format required by the component
const formatInventoryAlertsDetails = (apiData) => {
  return apiData.map((item) => ({
    itemName: item.name,
    percentage: item.percentage,
    color: BAR_COLORS[item.warningLevel],
    maxStock: item.maxStock,
    availableCount: item.quantity,
    unit: item.unit,
    warningLevel: item.warningLevel,
  }));
};

const InventoryAlerts = () => {
  const [inventoryAlertsDetails, setInventoryAlertsDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInventoryAlertsDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getInventoryAlertsAPI();
      //handle error
      if (error) {
        toast.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        const formattedData = formatInventoryAlertsDetails(data);
        setInventoryAlertsDetails(formattedData);
      }
      //disable loading
      setLoading(false);
    };

    fetchInventoryAlertsDetails();
  }, []);

  // when loading show 4 skeleton components
  if (loading) {
    return (
      <div className="mt-4 flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center justify-between rounded-xl border border-gray-100 bg-gray-50/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-100" />
                <div className="h-3 w-12 rounded bg-gray-50" />
              </div>
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-xl bg-red-50 p-2">
            <PackageX size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Inventory Alerts</h2>
            <p className="text-xs text-gray-400">Low &amp; critical stock</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase text-green-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> Live
        </span>
      </div>

      {inventoryAlertsDetails.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <PackageX size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">All stock levels healthy</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-2 min-h-0">
          {inventoryAlertsDetails.map((item, index) => (
            <KitchenStatBar
              key={index}
              itemName={item.itemName}
              percentage={item.percentage}
              color={item.color}
              maxStock={item.maxStock}
              quantity={item.availableCount}
              unit={item.unit}
              warningLevel={item.warningLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
