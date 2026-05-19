import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/loans':      'Loan Portfolio',
  '/customers':  'Customers',
  '/alerts':     'Alerts & Notifications',
  '/reports':    'Reports',
  '/analytics':  'Analytics',
  '/settings':   'Settings',
}

export default function PageContainer() {
  const location = useLocation()
  const title    = PAGE_TITLES[location.pathname] ?? 'NPL Monitor'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 pt-16">
          <div className="p-6 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
