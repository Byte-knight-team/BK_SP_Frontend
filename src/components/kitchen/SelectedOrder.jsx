import React from "react";

const SelectedOrder = ({ orderId }) => {
  return (
    <div className="flex h-full flex-col rounded-lg bg-white">
      <h2 className="mb-4 border-b pb-4 text-xl font-bold">Order Details</h2>
      <p className="text-lg text-gray-700">
        Selected Order ID: <span className="font-semibold">{orderId}</span>
      </p>
      {/* මේ orderId එක පාවිච්චි කරලා ඉස්සරහට API එකෙන් data අරන් මෙතන පෙන්නන්න පුළුවන් */}
    </div>
  );
};

export default SelectedOrder;
