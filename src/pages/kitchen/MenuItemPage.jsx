import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'

import { getAllMenuItemsAPI, createMenuItemAPI, updateMenuItemAPI } from '../../apis/kitchen/menu'
import MenuItemsGrid from '../../components/kitchen/menu/MenuItemsGrid'
import AddMenuItemModal from '../../components/kitchen/menu/AddMenuItemModal'
import EditMenuItemModal from '../../components/kitchen/menu/EditMenuItemModal'

const MenuAndRecipesPage = () => {
  const { setHeaderInfo } = useOutletContext()

  // All menu items loaded from the backend
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal visibility state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // The item selected for editing
  const [selectedItem, setSelectedItem] = useState(null)

  // Set the page header (title, subtitle, icon shown by MainLayout)
  useEffect(() => {
    setHeaderInfo({
      title: 'Menu Items',
      description: 'View active items and manage your pending submissions.',
      Icon: UtensilsCrossed,
    })
  }, [setHeaderInfo])

  // Load all menu items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await getAllMenuItemsAPI()
    if (error) {
      toast.error('Failed to load menu items.')
    } else {
      setItems(data || [])
    }
    setIsLoading(false)
  }

  // Derive unique categories from the loaded items
  // (CHEF role cannot access the /api/v1/categories endpoint directly)
  const categories = Array.from(
    new Map(
      items
        .filter((item) => item.categoryId && item.categoryName)
        .map((item) => [item.categoryId, { id: item.categoryId, name: item.categoryName }])
    ).values()
  )

  // Handle new menu item submission — reload list on success
  const handleAdd = async (payload) => {
    const { error } = await createMenuItemAPI(payload)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Menu item submitted for approval!')
      setIsAddOpen(false)
      fetchItems()
    }
  }

  // Handle edit submission — reload list on success
  const handleEdit = async (id, payload) => {
    const { error } = await updateMenuItemAPI(id, payload)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Menu item updated and resubmitted!')
      setIsEditOpen(false)
      setSelectedItem(null)
      fetchItems()
    }
  }

  // Open the edit modal with the clicked item pre-loaded
  const openEdit = (item) => {
    setSelectedItem(item)
    setIsEditOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Main grid — tabs, search, and cards */}
      <MenuItemsGrid
        items={items}
        isLoading={isLoading}
        onAdd={() => setIsAddOpen(true)}
        onEdit={openEdit}
      />

      {/* Add menu item modal */}
      <AddMenuItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        categories={categories}
      />

      {/* Edit menu item modal — only mounted when an item is selected */}
      <EditMenuItemModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleEdit}
        item={selectedItem}
        categories={categories}
      />

    </div>
  )
}

export default MenuAndRecipesPage
