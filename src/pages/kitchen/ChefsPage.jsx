import { useState } from "react";
import Stats from "../../components/kitchen/chefs/Stats";
import { ChefHat } from "lucide-react";
import ChefsDetailsTable from "../../components/kitchen/chefs/ChefsDetailsTable";
import AddChefModal from "../../components/kitchen/chefs/AddChefModal";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";

const ChefsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Chefs Management",
      description: "Manage chef profiles, track assignments, and monitor performance metrics.",
      Icon: ChefHat,
    });
  }, [setHeaderInfo]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="flex flex-row items-center gap-4 p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto cursor-pointer rounded-xl bg-orange-500 px-4 py-2 text-white shadow-sm"
        >
          + Add Chef
        </button>
      </div>
      <div className="mt-6 grid grid-cols-5 gap-4">
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
      <AddChefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ChefsPage;
