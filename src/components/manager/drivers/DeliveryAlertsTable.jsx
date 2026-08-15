import React from 'react'
import { AlertCircle, MapPin, Navigation, Clock, UserX } from 'lucide-react'

export default function DeliveryAlertsTable({ alerts, onAssignDriver }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <AlertCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          All Clear — No Active Alerts
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          There are no active delivery alerts. All deliveries are either
          completed or currently running smoothly.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-red-50/30 px-6 py-4">
        <h3 className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle className="h-5 w-5" />
          Requires Immediate Re-assignment ({alerts.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Route Context
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Aborted By
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {alerts.map((alert) => (
              <tr key={alert.deliveryId} className="hover:bg-red-50/10">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {alert.orderNumber}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Alert
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {alert.customerName}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Cancelled at {alert.cancelledAt}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Pickup:
                        </span>{' '}
                        <span className="text-gray-600">
                          {alert.branchName || 'Branch'}
                        </span>
                      </div>
                    </div>

                    <div className="ml-2 h-4 border-l-2 border-dashed border-gray-300"></div>

                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Deliver to:
                        </span>{' '}
                        <span className="text-gray-600">
                          {alert.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <UserX className="h-4 w-4 text-red-500" />
                    {alert.cancelledDriverName}
                  </div>
                  <div className="mt-1 max-w-[200px] text-xs text-red-600">
                    <span className="font-medium">Reason: </span>
                    {alert.cancelledReason || 'No reason provided'}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() =>
                      onAssignDriver({
                        orderId: alert.orderId,
                        id: alert.orderNumber,
                        customerName: alert.customerName,
                        zone: alert.deliveryAddress,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none"
                  >
                    <Navigation className="h-4 w-4" />
                    Re-Assign Driver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
