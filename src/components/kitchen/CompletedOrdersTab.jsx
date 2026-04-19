import OrderCard from "./OrderCard";

const CompletedOrdersTab = () => {
    return (
        <div>
            <OrderCard status="Completed" time="10:00 AM" id="#ORD-12345" numberOfItems={3}/>
        </div>
    );
};

export default CompletedOrdersTab;