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
