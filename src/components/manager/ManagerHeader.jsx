import AppHeader from "../common/AppHeader";
import ManagerNotificationBell from "./ManagerNotificationBell";

export default function ManagerHeader() {
  return (
    <AppHeader
      title="Manager Panel"
      subtitle="Operations overview and branch coordination"
    >
      <ManagerNotificationBell />
    </AppHeader>
  );
}