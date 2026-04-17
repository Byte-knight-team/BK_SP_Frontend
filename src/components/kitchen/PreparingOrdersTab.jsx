import OrderCard from "./OrderCard";

const PreparingOrdersTab = () => {
    

    return (
        <div>
            <OrderCard OrderStatus="Preparing" Time="10:00 AM" OrderID="#ORD-12345" NumberOfItems="3 Items"/>
        </div>
    );
};

export default PreparingOrdersTab;