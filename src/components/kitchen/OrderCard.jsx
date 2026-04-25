const statesColours = {
  PENDING: "bg-orange-50 text-orange-500",
  PREPARING: "bg-blue-50 text-blue-500",
  COMPLETED: "bg-green-50 text-green-500",
  "ON HOLD": "bg-red-50 text-red-500",
};

const timeLabels = {
  PENDING: "Received at",
  PREPARING: "Started at",
  COMPLETED: "Completed at",
  "ON HOLD": "Hold at",
};

const OrderCard = ({ status, time, id, numberOfItems, onClick, isClickable = true }) => {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all ${isClickable ? "cursor-pointer hover:shadow-md hover:border-orange-100" : "cursor-default"}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${statesColours[status]}`}>
          {status}
        </span>
        {/* Dynamically pick the correct label based on the current status */}
        <p className="text-xs font-medium text-gray-400">{timeLabels[status]} {time}</p>
      </div>
      <h2 className="text-xl font-bold text-gray-800">{id}</h2>
      <p className="text-sm font-medium text-gray-400">{numberOfItems} Items</p>
    </div>
  );
};

export default OrderCard;
