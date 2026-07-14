import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'

import {
  getMyMenuItemsAPI,
  createMenuItemAPI,
  getMenuItemIngredientsAPI,
  saveMenuItemIngredientsAPI,
  getActiveCategoriesAPI,
  getMyEditRequestsAPI,
} from '../../apis/kitchen/menu'
import { getAllInventoryAPI } from '../../apis/kitchen/inventory'
import MenuItemsGrid from '../../components/kitchen/menu/MenuItemsGrid'
import AddMenuItemModal from '../../components/kitchen/menu/AddMenuItemModal'
import MenuItemDetailModal from '../../components/kitchen/menu/MenuItemDetailModal'


const MenuItemPage = () => {
  const { setHeaderInfo } = useOutletContext()

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Inventory items needed by IngredientPicker inside AddMenuItemModal
  const [inventoryItems, setInventoryItems] = useState([])

  // ACTIVE categories only, for the create-item dropdown
  const [categories, setCategories] = useState([])

  const [isAddOpen, setIsAddOpen] = useState(false)

  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [viewIngredients, setViewIngredients] = useState([])
  // All of this item's own PENDING edit requests — a chef can have more than one
  const [viewPendingRequests, setViewPendingRequests] = useState([])

  useEffect(() => {
    setHeaderInfo({
      title: 'Menu Items',
      description: 'View active items and manage your pending submissions.',
      Icon: UtensilsCrossed,
    })
  }, [setHeaderInfo])

  useEffect(() => {
    fetchItems()
    fetchInventory()
    fetchCategories()
  }, [])

  // silent = true skips the loading flash (used after create so the grid
  // updates in place instead of clearing and re-rendering the whole list)
  const fetchItems = async (silent = false) => {
    if (!silent) setIsLoading(true)
    const { data, error } = await getMyMenuItemsAPI()
    if (error) toast.error('Failed to load menu items.')
    else setItems(data || [])
    if (!silent) setIsLoading(false)
  }

  // Fetch all inventory items so the IngredientPicker (create-item form) has a list to choose from
  const fetchInventory = async () => {
    const { data, error } = await getAllInventoryAPI()
    if (!error && data) setInventoryItems(data)
  }

  // ACTIVE categories only — an INACTIVE category can't take new items
  const fetchCategories = async () => {
    const { data, error } = await getActiveCategoriesAPI()
    if (!error && data) setCategories(data)
  }

  // Create new item, then save its ingredient list if the chef added any
  const handleAdd = async (payload, ingredients) => {
    const { data, error } = await createMenuItemAPI(payload)
    if (error) {
      toast.error(error)
      return
    }

    // Save ingredients only if the chef added at least one
    if (ingredients.length > 0) {
      const { error: ingError } = await saveMenuItemIngredientsAPI(data.id, ingredients)
      if (ingError) toast.warning('Item created but failed to save ingredients.')
    }

    toast.success('Menu item submitted for approval!')
    setIsAddOpen(false)
    fetchItems(true)
  }

  // All of this item's PENDING edit requests, newest last — the detail modal
  // lists every one of these alongside the always-available request form
  const findPendingRequests = async (itemId) => {
    const { data } = await getMyEditRequestsAPI()
    return (data || []).filter((r) => r.menuItemId === itemId && r.status === 'PENDING')
  }

  const openView = async (item) => {
    setViewItem(item)
    setIsViewOpen(true)
    const [{ data: ingredients }, pending] = await Promise.all([
      getMenuItemIngredientsAPI(item.id),
      item.status === 'ACTIVE' ? findPendingRequests(item.id) : Promise.resolve([]),
    ])
    setViewIngredients(ingredients || [])
    setViewPendingRequests(pending)
  }

  // After submitting a new edit request, silently refresh the list so it
  // shows up immediately without closing/reopening the modal
  const handleRequestSubmitted = async () => {
    if (!viewItem) return
    setViewPendingRequests(await findPendingRequests(viewItem.id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <MenuItemsGrid
        items={items}
        isLoading={isLoading}
        onAdd={() => setIsAddOpen(true)}
        onView={openView}
      />

      <AddMenuItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        categories={categories}
        inventoryItems={inventoryItems}
      />

      <MenuItemDetailModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false)
          setViewItem(null)
          setViewIngredients([])
          setViewPendingRequests([])
        }}
        item={viewItem}
        ingredients={viewIngredients}
        pendingEditRequests={viewPendingRequests}
        onRequestSubmitted={handleRequestSubmitted}
      />

    </div>
  )
}

export default MenuItemPage
