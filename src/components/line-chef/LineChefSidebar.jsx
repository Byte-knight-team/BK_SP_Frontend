import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppSidebar from '../common/AppSidebar'
import { lineChefNav } from '../../config/nav/lineChefNav'

export default function LineChefSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <AppSidebar
      navItems={lineChefNav}
      branchName={user?.branchName || 'Assigned Branch'}
      userName={user?.fullName || user?.username || user?.email || 'Line Chef'}
      roleLabel={user?.roleName || 'LINE_CHEF'}
      profilePath="/line-chef/profile"
      onLogout={handleLogout}
    />
  )
}
