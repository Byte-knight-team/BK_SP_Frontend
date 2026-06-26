import { Plus, Search } from 'lucide-react'
import ProgressBar from '../ProgressBar'
import { useState, useEffect } from 'react'
import {
  getAllInventoryAPI,
  createInventoryRequestAPI,
  updateInventoryStockAPI,
} from '../../../apis/kitchen/inventory'
import InventoryRequestModal from './InventoryRequestModal'
import UpdateStockModal from './UpdateStockModal'
import { toast } from 'react-toastify'

const InventoryTable = () => {

  const [loading, setLoading] = useState(false)
  const [inventoryData, setInventoryData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  //-------------- Update Stock Modal --------------
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateItemName, setUpdateItemName] = useState('')
  const [updateUnit, setUpdateUnit] = useState('')
  const [updateCurrentQty, setUpdateCurrentQty] = useState('')
  const [updateMaxStock, setUpdateMaxStock] = useState('')

  // function to open the update modal
  const handleOpenUpdateModal = (item) => {
    setUpdateItemName(item.name)
    setUpdateUnit(item.unit)
    setUpdateCurrentQty(item.quantity)
    setUpdateMaxStock(item.maxStock)
    setIsUpdateModalOpen(true)
  }

  // function to submit the update modal
  const handleUpdateSubmit = async (updateData) => {
    const { data, error } = await updateInventoryStockAPI(updateData)

    if (error) {
      toast.error('Failed to update stock: ' + error)
    } else {
      toast.success(data.message)
      setIsUpdateModalOpen(false)
      fetchInventory(false)
    }
  }

  //-------------- Inventory Request Modal --------------
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItemName, setSelectedItemName] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')

  // when clicking the "Request New Item" button
  const handleOpenNewItemModal = () => {
    setModalType('ADD_NEW_ITEM')
    setSelectedItemName('')
    setSelectedUnit('')
    setIsRequestModalOpen(true)
  }

  // when clicking the "Request" button on a specific row
  const handleOpenRefillModal = (item) => {
    setModalType('REFILL_STOCK')
    setSelectedItemName(item.name) // from DTO
    setSelectedUnit(item.unit) // from DTO
    setIsRequestModalOpen(true)
  }

  // function to Submit the Modal
  const handleModalSubmit = async (requestData) => {
    const { data, error } = await createInventoryRequestAPI(requestData)

    if (error) {
      toast.error('Failed to send request: ' + error)
    } else {
      toast.success(data.message)
      setIsRequestModalOpen(false)
    }
  }

  const fetchInventory = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data, error } = await getAllInventoryAPI()
    if (data) {
      setInventoryData(data)
    } else {
      console.error('Failed to load inventory:', error)
    }
    if (showLoading) setLoading(false)
  }

  useEffect(() => {
    fetchInventory(true)
  }, [])

  // FILTERING LOGIC: We create a new array containing only items that match the search term
  // We use .toLowerCase() so that searching for "Chicken" or "chicken" both work.
  const filteredInventory = inventoryData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-medium text-gray-400">
        Loading inventory...
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* header actions */}
      <div className="flex flex-row justify-between">
        <div>
          {/* SEARCH BAR: Using relative positioning to put the icon inside the box */}
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pr-4 pl-11 text-sm font-medium"
              value={searchTerm} // save the value as searchTerm
              onChange={(e) => setSearchTerm(e.target.value)} //update the value of searchterm
            />
          </div>
        </div>
        <div className="mb-8 flex flex-row justify-end gap-3">
          <button
            // call the function to open modal to add a new item
            onClick={handleOpenNewItemModal}
            className="flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-700"
          >
            <Plus size={18} /> Request New Item
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-sm font-black text-gray-400 uppercase">
              <th className="px-6 pb-2 text-center">Item Name</th>
              <th className="px-6 pb-2 text-center">Unit</th>
              <th className="px-6 pb-2 text-left">
                Stock Status (Current Qty)
              </th>
              <th className="px-6 pb-2 text-center">Max Stock</th>
              <th className="px-6 pb-2 text-center">Level</th>
              <th className="px-6 pb-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* RENDER FILTERED DATA: We map over filteredInventory instead of inventoryData */}
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item, index) => (
                <tr
                  key={index}
                  className="group transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-400">
                    {item.unit}
                  </td>

                  {/* progress bar column */}
                  <td className="px-4 py-3">
                    <div className="flex min-w-[220px] items-center gap-4">
                      <div className="flex-1">
                        <ProgressBar
                          percentage={item.percentage}
                          color={
                            item.warningLevel === 'CRITICAL'
                              ? '#EF4444' //red
                              : item.warningLevel === 'LOW'
                                ? '#F97316' //orange
                                : '#22C55E' //green
                          }
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-black text-gray-800">
                        {item.quantity}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm font-bold text-gray-400">
                    {item.maxStock}
                  </td>

                  {/* status */}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-4 py-1.5 text-[11px] font-black tracking-tighter uppercase ${
                        item.warningLevel === 'CRITICAL'
                          ? 'border border-red-100 bg-red-50 text-red-500'
                          : item.warningLevel === 'LOW'
                            ? 'border border-orange-100 bg-orange-50 text-orange-500'
                            : 'border border-green-100 bg-green-50 text-green-500'
                      }`}
                    >
                      {item.warningLevel}
                    </span>
                  </td>

                  {/* action buttons */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        // call the function to open modal to update stock
                        onClick={() => handleOpenUpdateModal(item)}
                        className="rounded-lg bg-orange-50 px-4 py-2 text-[11px] font-bold text-orange-700 transition-all hover:bg-orange-100"
                      >
                        Update
                      </button>
                      <button
                        // call the function to open modal to request stock refill
                        onClick={() => handleOpenRefillModal(item)}
                        className="rounded-lg bg-orange-50 px-4 py-2 text-[11px] font-bold text-orange-700 transition-all hover:bg-orange-100"
                      >
                        Request
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Show this if no items match the search
              <tr>
                <td
                  colSpan="6"
                  className="py-20 text-center font-medium text-gray-400"
                >
                  No items match "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* the inventory request modal */}
      <InventoryRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleModalSubmit}
        requestType={modalType}
        initialItemName={selectedItemName}
        initialUnit={selectedUnit}
      />

      {/* the Update Stock Modal */}
      <UpdateStockModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        itemName={updateItemName}
        unit={updateUnit}
        currentQuantity={updateCurrentQty}
        maxStock={updateMaxStock}
      />
    </div>
  )
}

export default InventoryTable
