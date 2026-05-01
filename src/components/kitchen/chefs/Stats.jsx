import { useState, useEffect } from "react";
import StatCard from "../StatCard";
import { Users, CookingPot } from "lucide-react";
import { getChefsStatsAPI } from "../../../apis/kitchen/chefs";

const formatStatCardDetails = (apiData) => {
  return [
    {
      title: "Total Chefs",
      value: apiData.totalChefs || 0,
      icon: <Users color="#E64919" size={28} />,
      iconBgColor: "bg-orange-50",
    },
    {
      title: "On-duty Chefs",
      value: apiData.onDutyChefs || 0,
      icon: <Users color="#A855F7" size={40} />,
      iconBgColor: "bg-purple-50",
    },
    {
      title: "Off-duty Chefs",
      value: apiData.offDutyChefs || 0,
      icon: <Users color="#4CAF50" size={40} />,
      iconBgColor: "bg-green-50",
    },
    {
      title: "Available Chefs",
      value: apiData.availableChefs || 0,
      icon: <Users color="#4F83FF" size={40} />,
      iconBgColor: "bg-blue-50",
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
      const { data, error } = await getChefsStatsAPI();
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

  if (loading) {
    return <div>Loading...</div>;
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
