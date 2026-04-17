const statesColours = {
  Pending: "bg-orange-400",
  Preparing: "bg-blue-400",
  Completed: "bg-green-400",
  Cancelled: "bg-red-400",
}

const getBgColor = (OrderStatus) => {
  return statesColours[OrderStatus];
}

const OrderCard = ({ OrderStatus, Time, OrderID, NumberOfItems, onClick }) => {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm cursor-pointer" onClick={onClick}>
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className={`text-xl font-bold text-gray-800 ${getBgColor(OrderStatus)} rounded-lg px-2 py-1`}>
            {OrderStatus}
          </h1>
        </div>
        <div>
          <p className="text-xl font-medium text-gray-400">
            {Time}
          </p>
        </div>
      </div>
      <div>
        <p className="text-4xl font-medium text-gray-800">
          {OrderID}
        </p>
      </div>
      <div>
        <p className="text-xl font-medium text-gray-400">
          {NumberOfItems}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
