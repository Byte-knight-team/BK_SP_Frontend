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
        console.error("Error fetching popular meals:", error);
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
        <span className="text-sm font-medium text-gray-400">Past 7 Days</span>
      </div>

      <div className="flex flex-col gap-2 mt-4">
      {/* 
        if Items available -> map
        else -> show no data available message
      */}
      {popularMealsDetails.length > 0 ? (
        popularMealsDetails.map((meal, index) => (
          <KitchenStatBar
            key={index}
            mealName={meal.mealName}
            percentage={meal.percentage}
            color={meal.color}
            count={meal.count}
          />
        ))
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-400">No popular meals found in the last 24 hours.</p>
        </div>
      )}
    </div>

    </>
  );
};

export default MostPopularMeals;
