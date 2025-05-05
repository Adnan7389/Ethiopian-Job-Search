import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/employers" className="hover:text-gray-300">Employers</Link>
          <Link to="/users" className="hover:text-gray-300">Users</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;