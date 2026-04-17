import OrderCard from "./OrderCard";

const CancelledOrdersTab = () => {
    return (
        <div>
            <OrderCard OrderStatus="Cancelled" Time="10:00 AM" OrderID="#ORD-12345" NumberOfItems="3 Items"/>
        </div>
    );
};

export default CancelledOrdersTab;