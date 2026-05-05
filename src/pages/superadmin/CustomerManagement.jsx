import { useState } from "react";

export default function CustomerManagement() {
    /*
     * message stores the text shown after button click.
     * setMessage is used to update that message.
     */
    const [message, setMessage] = useState("");

    /*
     * customerName stores the value typed in the input box.
     */
    const [customerName, setCustomerName] = useState("");

    /*
     * active stores checkbox true/false value.
     */
    const [active, setActive] = useState(false);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">
                    Customer Management
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Customer Management page. Connect soon!
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => setMessage("Button clicked successfully!")}
                    className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                    Add Customer
                </button>

                {message && (
                    <p className="text-sm font-medium text-green-700">
                        {message}
                    </p>
                )}

                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm"
                />

                <p className="mt-3 text-sm text-gray-600">
                    Typed name: {customerName}
                </p>

                <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="h-4 w-4"
                    />
                    Active Customer
                </label>

                <p className="mt-2 text-sm text-gray-600">
                    Status: {active ? "Active" : "Inactive"}
                </p>

                <table className="mt-6 w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-gray-500">
                            <th className="py-3">Name</th>
                            <th className="py-3">Email</th>
                            <th className="py-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="border-b">
                            <td className="py-3">Kasun Perera</td>
                            <td className="py-3">kasun@test.com</td>
                            <td className="py-3">Active</td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-3">Nimal Silva</td>
                            <td className="py-3">nimal@test.com</td>
                            <td className="py-3">Inactive</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}