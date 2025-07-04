import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, CalendarDays, ImageIcon, Plus, User, BookMarked, Trophy } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Home' },
    { path: '/journal', icon: <BookOpen size={20} />, label: 'Journal' },
    { path: '/calendar', icon: <CalendarDays size={20} />, label: 'Calendar' },
    { path: '/scrapbook', icon: <ImageIcon size={20} />, label: 'Scrapbook' },
    { path: '/achievements', icon: <Trophy size={20} />, label: 'Achievement Jar' },
    { path: '/reflection', icon: <BookMarked size={20} />, label: 'Reflection' },
    { 
      path: '/new-entry', 
      icon: <Plus size={20} />, 
      label: 'New Entry',
      className: 'bg-primary-600 text-white dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600'
    }
  ];

  // Add profile link at the bottom
  const bottomNavItems = [
    { path: '/profile', icon: <User size={20} />, label: 'Profile' }
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    
    const baseClasses = 'flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200';
    const activeClasses = 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200';
    const inactiveClasses = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60';
    
    const classes = item.className || (isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`);
    
    return (
      <NavLink to={item.path} className={classes}>
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
      
      <div className="py-6 px-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;