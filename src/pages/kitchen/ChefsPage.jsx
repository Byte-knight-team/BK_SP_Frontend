import Stats from "../../components/kitchen/chefs/Stats";
import { ChefHat } from "lucide-react";
import ChefsDetailsTable from "../../components/kitchen/chefs/ChefsDetailsTable";

const ChefsPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <div className="flex flex-row items-center gap-2 p-4">
        <div className="rounded-lg bg-orange-50 p-2">
          <ChefHat size={30} color="#E64919" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Chefs Management
        </h1>
      </div>
      <div className="mt-6 grid grid-cols-5 gap-4">
        <Stats />
      </div>
      <div className="mt-6 flex flex-1 rounded-2xl bg-white p-4">
        <div className="flex flex-col w-full gap-4">
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
