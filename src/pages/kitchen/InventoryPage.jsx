import InventoryTable from "../../components/kitchen/inventory/InventoryTable";
import { Boxes } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";

const InventoryPage = () => {
  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Kitchen Inventory",
      description: "Monitor and manage your kitchen supplies in real-time.",
      Icon: Boxes,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* The Table Component */}
      <InventoryTable />
    </div>
  );
};

export default InventoryPage;
