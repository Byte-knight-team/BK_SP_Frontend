import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/delivery/ProfileHeader";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <ProfileHeader name={user?.fullName || user?.username} />
      
      <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 italic">
        Order assignments coming soon...
      </div>
    </div>
  );
}
