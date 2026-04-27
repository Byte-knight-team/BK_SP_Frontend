import { useState, useEffect } from "react";
import StatCard from "../StatCard";
import {
  ClipboardClock,
  CookingPot,
  CircleCheckBig,
  Clock4,
} from "lucide-react";
import { getDashboardOrderStatsAPI } from "../../../apis/kitchen/dashboard";

const formatStatCardDetails = (apiData) => {
  return [
    {
      title: "Pending Orders",
      value: apiData.pendingOrders || 0,
      icon: <ClipboardClock color="#E64919" size={40} />,
      iconBgColor: "bg-orange-50",
    },
    {
      title: "Preparing Orders",
      value: apiData.preparingOrders || 0,
      icon: <CookingPot color="#4F83FF" size={40} />,
      iconBgColor: "bg-blue-50",
    },
    {
      title: "Completed Orders",
      value: apiData.completedOrders || 0,
      icon: <CircleCheckBig color="#4CAF50" size={40} />,
      iconBgColor: "bg-green-50",
    },
    {
      title: "Average Prep Time",
      value: apiData.averagePrepTimeInMinutes ? `${apiData.averagePrepTimeInMinutes} min` : "0 min",
      icon: <Clock4 color="#A855F7" size={40} />,
      iconBgColor: "bg-purple-50",
    },
  ];
};

const Stats = () => {
  const [statsDetails, setStatsDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatsDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getDashboardOrderStatsAPI();
      //handle error
      if (error) {
        console.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        const formattedData = formatStatCardDetails(data);
        setStatsDetails(formattedData);
      }
      //disable loading
      setLoading(false);
    };

    fetchStatsDetails();
  }, []);

  // When loading show 4 skeleton components
  if (loading) {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex h-32 animate-pulse flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6"
        >
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </>
  );
}

  return (
    <>
      {statsDetails.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconBgColor={card.iconBgColor}
        />
      ))}
    </>
  );
};

export default Stats;
