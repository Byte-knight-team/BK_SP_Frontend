import { useState } from "react";
import PropTypes from "prop-types";

const roles = [
  { id: 1, name: "Super Admin", type: "FULL ACCESS", typeColor: "text-orange-500", description: "Full system access, manage all settings, users and branches.", activeUsers: 3, permissions: 42 },
  { id: 2, name: "Admin", type: "RESTRICTED", typeColor: "text-gray-500", description: "Limited system access, manage all settings, users within the branch.", activeUsers: 3, permissions: 42 },
  { id: 3, name: "Manager", type: "RESTRICTED", typeColor: "text-gray-500", description: "Manage inventory, view reports, and manage orders.", activeUsers: 5, permissions: 28 },
  { id: 4, name: "Receptionist", type: "RESTRICTED", typeColor: "text-gray-500", description: "Handle incoming orders, table assignments, and customer inquiries.", activeUsers: 8, permissions: 12 },
  { id: 5, name: "Chief Chef", type: "RESTRICTED", typeColor: "text-gray-500", description: "View and process orders, update order status", activeUsers: 15, permissions: 8 },
  { id: 6, name: "Delivery Driver", type: "RESTRICTED", typeColor: "text-gray-500", description: "Manage delivery status and navigate to customer locations.", activeUsers: 12, permissions: 4 },
];

const permissionCategories = [
  {
    key: "orderManagement",
    label: "Order Management",
    items: [
      { name: "View Orders", description: "Ability to see all orders in real-time" },
      { name: "Edit Orders", description: "Modify order items or details" },
      { name: "Cancel Orders", description: "Cancel active or pending orders" },
    ],
  },
  {
    key: "menuManagement",
    label: "Menu Management",
    items: [
      { name: "View Menu", description: "See full menu structure" },
      { name: "Modify Items", description: "Add, edit or delete menu items" },
      { name: "Change Prices", description: "Update pricing for menu items" },
    ],
  },
  {
    key: "userManagement",
    label: "User Management",
    items: [
      { name: "View Users", description: "See all staff members and their roles" },
      { name: "Create Users", description: "Add new staff accounts" },
      { name: "Edit Users", description: "Modify staff details and roles" },
      { name: "Delete Users", description: "Remove staff accounts from the system" },
    ],
  },
  {
    key: "branchManagement",
    label: "Branch Management",
    items: [
      { name: "View Branches", description: "See all branch locations and details" },
      { name: "Create Branches", description: "Register new branch locations" },
      { name: "Edit Branches", description: "Modify branch settings and info" },
    ],
  },
  {
    key: "reports",
    label: "Reports & Analytics",
    items: [
      { name: "View Reports", description: "Access sales and performance reports" },
      { name: "Export Data", description: "Download reports in CSV or PDF" },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    items: [
      { name: "View Deliveries", description: "See all active and past deliveries" },
      { name: "Assign Drivers", description: "Assign delivery drivers to orders" },
      { name: "Update Status", description: "Change delivery status in real-time" },
    ],
  },
];

// Build default permissions per role
const buildDefaults = () => {
  const defaults = {};
  roles.forEach((role) => {
    const perms = {};
    permissionCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        // Super Admin gets everything on
        if (role.name === "Super Admin") { perms[`${cat.key}.${item.name}`] = true; return; }
        if (role.name === "Admin") {
          perms[`${cat.key}.${item.name}`] = !["Delete Users", "Create Branches"].includes(item.name);
          return;
        }
        if (role.name === "Manager") {
          const on = ["View Orders", "Edit Orders", "Cancel Orders", "View Menu", "Modify Items", "View Users", "View Branches", "View Reports", "View Deliveries", "Assign Drivers"];
          perms[`${cat.key}.${item.name}`] = on.includes(item.name);
          return;
        }
        if (role.name === "Receptionist") {
          const on = ["View Orders", "Edit Orders", "Cancel Orders", "View Menu", "View Deliveries"];
          perms[`${cat.key}.${item.name}`] = on.includes(item.name);
          return;
        }
        if (role.name === "Chief Chef") {
          const on = ["View Orders", "Edit Orders", "View Menu"];
          perms[`${cat.key}.${item.name}`] = on.includes(item.name);
          return;
        }
        if (role.name === "Delivery Driver") {
          const on = ["View Orders", "View Deliveries", "Update Status"];
          perms[`${cat.key}.${item.name}`] = on.includes(item.name);
          return;
        }
        perms[`${cat.key}.${item.name}`] = false;
      });
    });
    defaults[role.name] = perms;
  });
  return defaults;
};

export default function RolesPermissions({ onPageChange }) {
  const [selectedRole, setSelectedRole] = useState("Receptionist");
  const [rolePermissions, setRolePermissions] = useState(buildDefaults);

  const togglePermission = (categoryKey, permName) => {
    const key = `${categoryKey}.${permName}`;
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole][key],
      },
    }));
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="flex gap-6">
        {/* Left - Roles List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="text-sm text-gray-500">Define what each staff member can see and do</p>
            </div>
            <button onClick={() => onPageChange("create-role")} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Role
            </button>
          </div>

          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedRole(role.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedRole(role.name);
                  }
                }}
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedRole === role.name ? "border-orange-500 shadow-md" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        role.type === "FULL ACCESS" ? "border-orange-200 text-orange-500 bg-orange-50" : "border-gray-200 text-gray-500 bg-gray-50"
                      }`}>
                        {role.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {role.activeUsers} Active Users
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {role.permissions} Permissions
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Permission Preview */}
        <div className="w-80">
          <div className="bg-white rounded-xl border border-gray-100 p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="font-semibold text-gray-900">Permission Preview</h3>
            <p className="text-sm text-gray-500 mb-4">Currently viewing: {selectedRole}</p>

            <div className="space-y-4">
              {permissionCategories.map((cat) => (
                <div key={cat.key}>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat.label}</h4>
                  {cat.items.map((perm) => {
                    const isEnabled = rolePermissions[selectedRole]?.[`${cat.key}.${perm.name}`] ?? false;
                    return (
                      <div key={perm.name} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{perm.name}</p>
                          <p className="text-xs text-gray-400">{perm.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePermission(cat.key, perm.name)}
                          className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors shrink-0 ${isEnabled ? "bg-orange-500" : "bg-gray-200"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? "translate-x-4" : ""}`}></div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


RolesPermissions.propTypes = {
  onPageChange: PropTypes.func.isRequired,
};