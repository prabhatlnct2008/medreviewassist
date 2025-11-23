import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';
import { LogOut, User, Settings, LayoutDashboard, Users } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">MedReview Assist</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/patients"
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-primary"
              >
                <Users className="h-4 w-4" />
                <span>Patients</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
              <span>{user?.first_name} {user?.last_name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
