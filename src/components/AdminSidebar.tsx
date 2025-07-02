'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiChartBar, 
  HiUsers, 
  HiDocumentText, 
  HiSpeakerphone,
  HiLogout 
} from 'react-icons/hi';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HiChartBar },
  { name: 'Users', href: '/admin/users', icon: HiUsers },
  { name: 'Posts', href: '/admin/posts', icon: HiDocumentText },
  { name: 'Notices', href: '/admin/notices', icon: HiSpeakerphone },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex items-center justify-center h-16 bg-blue-600 dark:bg-blue-700">
        <h1 className="text-white text-xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-2 border-t dark:border-gray-700">
        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white rounded-md transition-colors">
          <HiLogout className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}