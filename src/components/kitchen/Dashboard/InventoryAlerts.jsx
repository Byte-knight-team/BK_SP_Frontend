import React from "react";
import KitchenStatBar from "../KitchenStatBar";
import { useState, useEffect } from "react";
import { getInventoryAlertsAPI } from "../../../apis/kitchen/dashboard";

//BAR_COLORS Object 
const BAR_COLORS = {
  LOW: "#F59E0B",
  CRITICAL: "#EF4444",
}

const formatInventoryAlertsDetails = (apiData) => { //to convert the data from the API to the format required by the component
  return apiData.map((item) => ({
    itemName: item.itemName,
    percentage: item.percentage,
    color: BAR_COLORS[item.warningLevel],
    initialCount: item.initialCount,
    availableCount: item.availableCount,
    unit: item.unit,
    warningLevel: item.warningLevel,
  }));
}

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
  
    if (loading) {
      return <div>Loading...</div>;
    }
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Inventory Alerts</h2>
      </div>

      <div className="flex flex-col gap-2">
        {inventoryAlertsDetails.map((item, index) => (
          <KitchenStatBar
            key={index}
            itemName={item.itemName}
            percentage={item.percentage}
            color={item.color}
            initialCount={item.initialCount}
            availableCount={item.availableCount}
            unit={item.unit}
            warningLevel={item.warningLevel}
          />
        ))}
      </div>
    </>
  );
};

export default InventoryAlerts;
