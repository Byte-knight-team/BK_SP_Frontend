import React from "react";
import { BarChart } from "../BarChart";
import { getPeakHoursAPI } from "../../../apis/kitchen/dashboard";
import { useState, useEffect } from "react";

// Dataset for the hourly performance bar chart. Represents the number of meals prepared during specific time shifts
// const graphData = [
//   { time: "8AM-10AM", mealsCount: 90 },
//   { time: "10AM-12PM", mealsCount: 50 },
//   { time: "12PM-2PM", mealsCount: 20 },
//   { time: "2PM-4PM", mealsCount: 10 },
//   { time: "4PM-6PM", mealsCount: 100 },
//   { time: "6PM-8PM", mealsCount: 50 },
//   { time: "8PM-10PM", mealsCount: 10 },
// ];

const PeakHoursChart = () => {
      const [graphData, setGraphData] = useState([]);
      const [loading, setLoading] = useState(false);
    
      useEffect(() => {
        const fetchGraphData = async () => {
          //enable loading
          setLoading(true);
          //api call
          const { data, error } = await getPeakHoursAPI(); //object destructuring
          //handle error
          if (error) {
            console.error("Error fetching stats details:", error);
            return;
          }
          //handle success
          if (data) {
            //const formattedData = formatOrdersDetails(data);
            //setPendingOrdersDetails(formattedData);
            setGraphData(data);
          }
          //disable loading
          setLoading(false);
        };
    
        fetchGraphData();
      }, []);
    
      if (loading) {
        return <div>Loading...</div>;
      }
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Peak Hours</h2>
        <span className="text-sm font-medium text-gray-400">Past 24 Hours</span>
      </div>

      <div className="mt-2 flex items-center justify-center">
        <BarChart
          data={graphData}
          index="time"
          categories={["mealsCount"]}
          colors={["orange"]}
          showLegend={false}
        />
      </div>
    </>
  );
};

export default PeakHoursChart;
