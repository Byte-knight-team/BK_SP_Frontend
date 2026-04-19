import React from "react";

const statesColours = {
  Pending: "bg-orange-400",
  Preparing: "bg-blue-400",
  Completed: "bg-green-400",
  Cancelled: "bg-red-400",
}

const getBgColor = (orderStatus) => {
  return statesColours[orderStatus];
}

const OrderCard = ({ status, time, id, numberOfItems, onClick, isClickable = true }) => {
  return (
    <div className={`flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default"}`} onClick={isClickable ? onClick : undefined}>
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className={`font-bold text-gray-800 ${getBgColor(status)} rounded-lg px-2 py-1`}>
            {status}
          </h1>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-400">
            {time}
          </p>
        </div>
      </div>
      <div>
        <p className="text-2xl font-medium text-gray-800">
          {id}
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-400">
          {numberOfItems} Items
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
