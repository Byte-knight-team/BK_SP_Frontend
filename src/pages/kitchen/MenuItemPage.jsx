import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'

import {
  getAllMenuItemsAPI,
  createMenuItemAPI,
  updateMenuItemAPI,
  getMenuItemIngredientsAPI,
  saveMenuItemIngredientsAPI,
} from '../../apis/kitchen/menu'
import { getAllInventoryAPI } from '../../apis/kitchen/inventory'
import MenuItemsGrid from '../../components/kitchen/menu/MenuItemsGrid'
import AddMenuItemModal from '../../components/kitchen/menu/AddMenuItemModal'
import EditMenuItemModal from '../../components/kitchen/menu/EditMenuItemModal'

const MenuItemPage = () => {
  const { setHeaderInfo } = useOutletContext()

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Inventory items needed by IngredientPicker inside the modals
  const [inventoryItems, setInventoryItems] = useState([])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Pre-loaded ingredients for the item being edited
  const [existingIngredients, setExistingIngredients] = useState([])

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
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await getAllMenuItemsAPI()
    if (error) toast.error('Failed to load menu items.')
    else setItems(data || [])
    setIsLoading(false)
  }

  // Fetch all inventory items so the IngredientPicker has a list to choose from
  const fetchInventory = async () => {
    const { data, error } = await getAllInventoryAPI()
    if (!error && data) setInventoryItems(data)
  }

  // Derive unique categories from loaded items
  // (CHEF role cannot access the /api/v1/categories endpoint directly)
  const categories = Array.from(
    new Map(
      items
        .filter((item) => item.categoryId && item.categoryName)
        .map((item) => [item.categoryId, { id: item.categoryId, name: item.categoryName }])
    ).values()
  )

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
    fetchItems()
  }

  // Update item, then save its updated ingredient list
  const handleEdit = async (id, payload, ingredients) => {
    const { error } = await updateMenuItemAPI(id, payload)
    if (error) {
      toast.error(error)
      return
    }

    // Always save ingredient list (even if empty — clears previous recipe)
    const { error: ingError } = await saveMenuItemIngredientsAPI(id, ingredients)
    if (ingError) toast.warning('Item updated but failed to save ingredients.')

    toast.success('Menu item updated and resubmitted!')
    setIsEditOpen(false)
    setSelectedItem(null)
    setExistingIngredients([])
    fetchItems()
  }

  // When chef clicks a card, load that item's existing ingredients before opening modal
  const openEdit = async (item) => {
    setSelectedItem(item)
    const { data } = await getMenuItemIngredientsAPI(item.id)
    // Map response to the shape IngredientPicker expects
    setExistingIngredients(
      (data || []).map((ing) => ({
        inventoryItemId: ing.inventoryItemId,
        inventoryItemName: ing.inventoryItemName,
        unit: ing.unit,
        quantityRequired: ing.quantityRequired,
      }))
    )
    setIsEditOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <MenuItemsGrid
        items={items}
        isLoading={isLoading}
        onAdd={() => setIsAddOpen(true)}
        onEdit={openEdit}
      />

      <AddMenuItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        categories={categories}
        inventoryItems={inventoryItems}
      />

      <EditMenuItemModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedItem(null)
          setExistingIngredients([])
        }}
        onSubmit={handleEdit}
        item={selectedItem}
        categories={categories}
        inventoryItems={inventoryItems}
        existingIngredients={existingIngredients}
      />

    </div>
  )
}

export default MenuItemPage
