import Stats from "../../components/kitchen/chefs/Stats";
import { ChefHat, LogIn, LogOut } from "lucide-react";
import ChefsDetailsTable from "../../components/kitchen/chefs/ChefsDetailsTable";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";

const ChefsPage = () => {
  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Chefs Management",
      description: "Manage chef profiles, track assignemnts, and monitor performance metrics.",
      Icon: ChefHat,
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stats />
      </div>
            {/* 2. Action Buttons Section */}
      <div className="mt-6 flex gap-4 justify-end gap-3">
        {/* Check In Button */}
        <button 
          onClick={() => console.log("Check In Clicked")}
          className="flex item-center gap-2 p-3 rounded-xl border border-orange-100 bg-white text-sm text-orange-600 transition-all hover:bg-orange-50 shadow-sm"
        >
          <LogIn size={24} />
          <div className="text-left">
            <p className="text-sm font-bold">Chef Check-In</p>
          </div>
        </button>

        {/* Check Out Button */}
        <button 
          onClick={() => console.log("Check Out Clicked")}
          className="flex item-center gap-2 p-3 rounded-xl border border-orange-100 bg-white text-sm text-orange-600 transition-all hover:bg-orange-50 shadow-sm"
        >
          <LogOut size={24} />
          <div className="text-left">
            <p className="text-sm font-bold">Chef Check-Out</p>
          </div>
        </button>
      </div>

      <div className="mt-6 flex flex-1 rounded-2xl bg-white p-4">
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Chefs Details
          </h1>
          <ChefsDetailsTable />
        </div>
      </div>
    </div>
  );
};

export default ChefsPage;
