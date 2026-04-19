import OrderCard from "./OrderCard";

const PreparingOrdersTab = () => {
    

    return (
        <div>
            <OrderCard status="Preparing" time="10:00 AM" id="#ORD-12345" numberOfItems={3}/>
        </div>
    );
};

export default PreparingOrdersTab;