import OrderCard from "./OrderCard";

const CompletedOrdersTab = () => {
    return (
        <div>
            <OrderCard OrderStatus="Completed" Time="10:00 AM" OrderID="#ORD-12345" NumberOfItems="3 Items"/>
        </div>
    );
};

export default CompletedOrdersTab;