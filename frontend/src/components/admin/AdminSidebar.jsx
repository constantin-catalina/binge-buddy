import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboard as LayoutDashboardIcon, List as ListIcon, PlusSquare as PlusSquareIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const AdminSidebar = () => {

    const user = {
        firstName: 'Admin',
        lastName: 'User',
        imageUrl: assets.profile,
    }

    const adminNavLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
        { name: 'Edit Shows', path: '/admin/edit-shows', icon: PlusSquareIcon },
        { name: 'Edit Users', path: '/admin/edit-users', icon: PlusSquareIcon },
    ]

  return (
    <div className='h-[calc(100vh-64px)] flex flex-col items-center pt-10
    w-full md:w-60 border-r border-gray-300/20 text-sm'>
        <img className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto'
        src={user.imageUrl} alt="sidebar"/>
        <p className='mt-2 text-base max-md:hidden'>
            {user.firstName} {user.lastName}
        </p>
        <div className='w-full'>
            {
            adminNavLinks.map((link, index) => (
                <NavLink key={index} to={link.path} end className={({ isActive }) =>
                    `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 first:mt-6
                    text-gray-400 ${isActive && 'bg-primary/15 text-primary group'}`
                }>
                    {
                        ({ isActive }) => (
                            <>
                                <link.icon className='w-5 h-5'/>
                                <p className='max-md:hidden'>{link.name}</p>
                                <span className={`w-1.5 h-10 rounded-l right-0 absolute
                                    ${isActive && 'bg-primary'}`}/>
                            </>
                        )
                    }
                </NavLink>
            ))
            }
        </div>
    </div>
  )
}

export default AdminSidebar