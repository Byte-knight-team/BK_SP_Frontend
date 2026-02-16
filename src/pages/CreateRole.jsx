import { useState } from "react";
import PropTypes from "prop-types";

const permissionGroups = [
  {
    title: "ORDER MANAGEMENT",
    permissions: [
      { key: "viewOrders", label: "View Orders", desc: "See real-time order queue" },
      { key: "editOrders", label: "Edit Orders", desc: "Modify items and quantities" },
      { key: "cancelOrders", label: "Cancel Orders", desc: "Void or refund transactions" },
    ],
  },
  {
    title: "MENU MANAGEMENT",
    permissions: [
      { key: "viewMenu", label: "View Menu", desc: "Browse menu database" },
      { key: "editItems", label: "Edit Items", desc: "Update item details and availability" },
      { key: "managePrices", label: "Manage Prices", desc: "Change base costs and discounts" },
    ],
  },
  {
    title: "STAFF MANAGEMENT",
    permissions: [
      { key: "viewStaff", label: "View Staff", desc: "See basic member profiles" },
      { key: "manageStaff", label: "Manage Staff", desc: "Add or deactivate accounts" },
      { key: "assignRoles", label: "Assign Roles", desc: "Update permission levels" },
    ],
  },
];

export default function CreateRole({ onPageChange }) {
  const [roleName, setRoleName] = useState("");
  const [accessLevel, setAccessLevel] = useState("restricted");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState({});

  // Collect every permission key from all groups
  const allPermKeys = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));

  const setFullAccess = () => {
    setAccessLevel("full");
    // Turn on every permission
    const all = {};
    allPermKeys.forEach((k) => (all[k] = true));
    setPerms(all);
  };

  const setRestricted = () => {
    setAccessLevel("restricted");
    // Clear all permissions so user can pick individually
    setPerms({});
  };

  const toggle = (key) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      {/* Back */}
      <button
        onClick={() => onPageChange("roles")}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
      <p className="text-sm text-gray-500 mb-6">Define access levels and department permissions</p>

      {/* General Information */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          GENERAL INFORMATION
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role Name</label>
            <input
              type="text"
              placeholder="e.g., Senior Floor Manager"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Access Level</label>
            <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
              <button
                onClick={setRestricted}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${accessLevel === "restricted" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                Restricted
              </button>
              <button
                onClick={setFullAccess}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${accessLevel === "full" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                Full Access
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role Description</label>
          <textarea
            placeholder="Briefly describe the responsibilities of this role..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
          />
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            PERMISSIONS MATRIX
          </h2>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Select specific permissions for this role</span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {permissionGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{group.title}</p>
              <div className="space-y-4">
                {group.permissions.map((p) => (
                  <div key={p.key} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                      <p className="text-xs text-gray-400">{p.desc}</p>
                    </div>
                    <button onClick={() => toggle(p.key)} disabled={accessLevel === "full"} className={`w-10 h-5 rounded-full transition-colors relative ${perms[p.key] ? "bg-orange-500" : "bg-gray-300"} ${accessLevel === "full" ? "opacity-70 cursor-not-allowed" : ""}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${perms[p.key] ? "left-5" : "left-0.5"}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <button onClick={() => onPageChange("roles")} className="px-6 py-2.5 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
          Cancel Creation
        </button>
        <button className="px-8 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-orange-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Create Role
        </button>
      </div>
    </div>
  );
}

CreateRole.propTypes = {
  onPageChange: PropTypes.func.isRequired,
};

