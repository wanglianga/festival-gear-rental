import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Package, User, Scan, ClipboardList } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const { userRole } = useAppStore();
  const location = useLocation();

  const audienceLinks = [
    { to: '/', label: '首页', icon: Home },
    { to: '/map', label: '地图', icon: Map },
    { to: '/orders', label: '订单', icon: Package },
    { to: '/profile', label: '我的', icon: User },
  ];

  const staffLinks = [
    { to: '/staff', label: '首页', icon: Home },
    { to: '/staff/scan', label: '扫码', icon: Scan },
    { to: '/staff/return', label: '验收', icon: ClipboardList },
    { to: '/staff/transfer', label: '调拨', icon: Package },
  ];

  const links = userRole === 'staff' ? staffLinks : audienceLinks;

  const isStaffPath = location.pathname.startsWith('/staff');
  const showNav = userRole === 'staff' ? isStaffPath : !isStaffPath;

  if (!showNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-festival-dark/95 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-neon-pink'
                  : 'text-gray-400 hover:text-white'
              )
            }
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
