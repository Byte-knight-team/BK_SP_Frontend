import KitchenStatBar from "../KitchenStatBar";
import { useState, useEffect } from "react";
import { getDashboardPopularMealsAPI } from "../../../apis/kitchen/dashboard";

const BAR_COLORS = ["#4CAF50", "#4F83FF", "#E64919", "#A855F7", "#FF9800"];

const formatPopularMealsDetails = (apiData) => { //to convert the data from the API to the format required by the component
  return apiData.map((meal, index) => ({
    mealName: meal.mealName,
    percentage: meal.percentage,
    color: BAR_COLORS[index],
    count: meal.count,
  }));
}

const MostPopularMeals = () => {
  const [popularMealsDetails, setPopularMealsDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPopularMealsDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getDashboardPopularMealsAPI();
      //handle error
      if (error) {
        console.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        const formattedData = formatPopularMealsDetails(data);
        setPopularMealsDetails(formattedData);
      }
      //disable loading
      setLoading(false);
    };

    fetchPopularMealsDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Most Popular Meals</h2>
        <span className="text-sm font-medium text-gray-400">Past 24 Hours</span>
      </div>

      <div className="flex flex-col gap-2">
        {popularMealsDetails.map((meal, index) => (
          <KitchenStatBar
            key={index}
            mealName={meal.mealName}
            percentage={meal.percentage}
            color={meal.color}
            count={meal.count}
          />
        ))}
      </div>
    </>
  );
};

export default MostPopularMeals;
