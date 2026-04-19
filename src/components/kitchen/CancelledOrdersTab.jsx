import OrderCard from "./OrderCard";

const CancelledOrdersTab = () => {
  return (
    <div>
      <OrderCard
        status="Cancelled"
        time="10:00 AM"
        id="#ORD-12345"
        numberOfItems={3}
      />
    </div>
  );
};

export default CancelledOrdersTab;
