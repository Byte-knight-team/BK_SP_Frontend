import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react' // Good icon for Menu/Recipes

const MenuAndRecipesPage = () => {
  const { setHeaderInfo } = useOutletContext()

  useEffect(() => {
    setHeaderInfo({
      title: 'Menu & Recipes',
      description: 'Explore recipes and manage menu items.',
      Icon: UtensilsCrossed,
    })
  }, [setHeaderInfo])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-900">Menu & Recipes</h1>
      {/* Content goes here */}
    </div>
  )
}

export default MenuAndRecipesPage
