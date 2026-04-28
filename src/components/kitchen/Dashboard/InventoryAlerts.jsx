import KitchenStatBar from "../KitchenStatBar";
import { useState, useEffect } from "react";
import { getInventoryAlertsAPI } from "../../../apis/kitchen/dashboard";

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
        console.error("Error fetching stats details:", error);
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
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Inventory Alerts</h2>
        <span
          className="text-sm font-medium text-gray-400"
          style={{
            color: "#4CAF50",
            backgroundColor: "lightgreen",
            borderRadius: "30px",
            padding: "5px",
          }}
        >
          Live
        </span>
      </div>

      <div className="flex h-[300px] flex-col gap-2 overflow-y-auto pr-2">
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
    </>
  );
};

export default InventoryAlerts;
