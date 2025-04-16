import React from 'react';
import { ChevronDown, Search, LayoutDashboard, User, Clock, ListTodo, Users, Calendar, FileText, BarChart2, Layers, Github, HelpCircle, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';


const SidebarNavigation = () => {
  const navigate = useNavigate();
  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">Z</div>
        <span className="font-semibold">Zozyo®</span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-6">
        {/* PINNED section */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">PINNED</p>
          <ul className="space-y-1">
           <Link to="/dashboard"><NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" /></Link>
           <Link to="/cart"><NavItem icon={<User size={18} />} label="Cart Info" isLoading /></Link>
            <Link to="/upload"><NavItem icon={<Clock size={18} />} label="Time-off" /></Link>
            <Link to="/print"><NavItem icon={<ListTodo size={18} />} label="Barcode" hasDropdown /></Link>
          </ul>
        </div>

        {/* COMPANY section */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">COMPANY</p>
          <ul className="space-y-1">
            <Link to="/employees"><NavItem icon={<Users size={18} />} label="Employees" /></Link>
            <Link to="/calendar"><NavItem icon={<Calendar size={18} />} label="Calendar" hasDropdown /></Link>
            <Link to="/files"><NavItem icon={<FileText size={18} />} label="Files" hasDropdown /></Link>
            <Link to="/report"><NavItem icon={<BarChart2 size={18} />} label="Report" hasDropdown /></Link>
          </ul>
        </div>

        {/* APPS section */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">APPS</p>
          <ul className="space-y-1">
            <NavItem icon={<Layers size={18} />} label="Stack" />
            <NavItem icon={<Github size={18} />} label="Github" />
          </ul>
        </div>

        {/* Bottom items */}
        <div className="pt-6">
          <ul className="space-y-1">
            <NavItem icon={<HelpCircle size={18} />} label="Support Center" />
            <NavItem icon={<BookOpen size={18} />} label="Getting Started" hasDropdown active />
          </ul>
        </div>
      </nav>
    </div>
  );
};

// NavItem component for consistent styling
const NavItem = ({ icon, label, hasDropdown = false, isLoading = false, active = false, onClick }) => {

  return (
    <li onClick={onClick}>
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer ${
          active ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          )}
          {hasDropdown && <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>
    </li>
  );
};

export default SidebarNavigation;