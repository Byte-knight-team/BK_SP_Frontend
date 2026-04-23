import React from "react";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { getChefsAPI } from "../../../apis/kitchen/chefs";

const ChefDetailsTable = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChefs = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getChefsAPI();
      //handle error
      if (error) {
        console.error("Error fetching chefs:", error);
        return;
      }
      //handle success
      if (data) {
        setChefs(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchChefs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        {/* --- Table Header --- */}
        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Chef Name</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Meals Assigned</th>
            <th className="px-6 py-4 text-right">Avg Prep Time</th>
          </tr>
        </thead>

        {/* --- Table Body --- */}
        <tbody className="divide-y divide-gray-50">
          {chefs.map((chef, index) => (
            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
              
              {/* Chef Name & Avatar */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    {/* මෙතනට පස්සේ රූපයක් දාන්න පුළුවන්, දැනට icon එකක් දාමු */}
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{chef.name}</p>
                  </div>
                </div>
              </td>

              {/* Status Badge */}
              <td className="px-6 py-4 text-center">
                <button className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  chef.status === 'Available' ? 'bg-green-50 text-green-600' : 
                  chef.status === 'Busy' ? 'bg-orange-50 text-orange-600' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    chef.status === 'Available' ? 'bg-green-600' : 
                    chef.status === 'Busy' ? 'bg-orange-600' : 'bg-gray-500'
                  }`}></span>
                  {chef.status}
                </button>
              </td>

              {/* Meals Assigned */}
              <td className="px-6 py-4 text-center font-bold text-gray-700">
                {chef.mealsAssigned}
              </td>

              {/* Avg Prep Time with Trend */}
              <td className="px-6 py-4 text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{chef.avgPrepTime}</span>
                  </div>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChefDetailsTable;