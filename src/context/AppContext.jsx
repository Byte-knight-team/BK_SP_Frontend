import { createContext, useContext, useState, useCallback } from 'react'
import Snackbar from '../components/common/Snackbar'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'success',
    position: 'bottom-center',
  })

  const showSnackbar = useCallback(
    (message, type = 'success', position = 'bottom-center') => {
      setSnackbar({ isOpen: true, message, type, position })

      setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, isOpen: false }))
      }, 4000)
    },
    [],
  )

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <AppContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar.isOpen && <Snackbar {...snackbar} onClose={closeSnackbar} />}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
