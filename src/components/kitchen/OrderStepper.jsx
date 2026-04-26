import { Clock, ChefHat, Check } from "lucide-react";

const getCompletedSteps = (status) => {
  switch (status) {
    case "PENDING":
      return [1];
    case "PREPARING":
      return [1, 2];
    case "COMPLETED":
      return [1, 2, 3];
    default:
      return [];
  }
};

const SimpleOrderStepper = ({ status = "PENDING" }) => {
  const completedSteps = getCompletedSteps(status);

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between py-8">
      {/* Pending */}
      <div className="flex flex-col items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
          completedSteps.includes(1)
            ? "border-orange-500 bg-orange-500 text-white shadow-md"
            : "border-gray-200 bg-gray-100 text-gray-400"
        }`}>
          <Clock size={24} />
        </div>
        <span className={`mt-2 text-xs font-bold ${completedSteps.includes(1) ? "text-orange-500" : "text-gray-400"}`}>
          Pending
        </span>
      </div>

      <div className={`mx-2 mt-[-20px] h-1 flex-1 rounded-full ${completedSteps.includes(2) ? "bg-orange-500" : "bg-gray-100"}`} />

      {/* Preparing */}
      <div className="flex flex-col items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
          completedSteps.includes(2)
            ? "border-orange-500 bg-orange-500 text-white shadow-md"
            : "border-gray-200 bg-gray-100 text-gray-400"
        }`}>
          <ChefHat size={24} />
        </div>
        <span className={`mt-2 text-xs font-bold ${completedSteps.includes(2) ? "text-orange-500" : "text-gray-400"}`}>
          Preparing
        </span>
      </div>

      <div className={`mx-2 mt-[-20px] h-1 flex-1 rounded-full ${completedSteps.includes(3) ? "bg-orange-500" : "bg-gray-100"}`} />

      {/* Completed */}
      <div className="flex flex-col items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
          completedSteps.includes(3)
            ? "border-orange-500 bg-orange-500 text-white shadow-md"
            : "border-gray-200 bg-gray-100 text-gray-400"
        }`}>
          <Check size={24} />
        </div>
        <span className={`mt-2 text-xs font-bold ${completedSteps.includes(3) ? "text-orange-500" : "text-gray-400"}`}>
          Completed
        </span>
      </div>
    </div>
  );
};

export default SimpleOrderStepper;
