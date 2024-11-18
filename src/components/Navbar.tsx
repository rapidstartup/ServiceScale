import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, BookOpen, LayoutDashboard, FileText, Layout, LogOut, Settings, BarChart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8" />
            <span className="text-xl font-bold">ServiceScale AI</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/dashboard')}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/quotes"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/quotes')}`}
              >
                <FileText className="h-4 w-4" />
                <span>Quotes</span>
              </Link>
              
              <Link
                to="/templates"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/templates')}`}
              >
                <Layout className="h-4 w-4" />
                <span>Templates</span>
              </Link>
              
              <Link
                to="/pricebook"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/pricebook')}`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Pricebook</span>
              </Link>
              
              <Link
                to="/customers"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/customers')}`}
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </Link>

              {user?.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    onBlur={() => setTimeout(() => setIsAdminMenuOpen(false), 200)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${
                      location.pathname.startsWith('/admin') ? 'bg-blue-700' : ''
                    }`}
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-l border-blue-500 pl-4 flex items-center space-x-4">
              <span className="text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;