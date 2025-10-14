import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
        <AdminNavbar/>
        <div className='flex flex-col md:flex-row min-h-screen'>
            <AdminSidebar/>
            <div className='flex-1 px-4 py-10 md:px-10 overflow-y-auto'>
                <Outlet/>
            </div>
        </div>
    </>
  );
};

export default Layout