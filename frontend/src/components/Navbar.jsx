import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu as MenuIcon, Search as SearchIcon, TicketPlus, User, X as XIcon, LayoutDashboard, LineChart } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {user} = useUser();
  const {openSignIn} = useClerk();

  const navigate = useNavigate();

  const handleSearch = (e) => {
    if(e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-2'>
      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt="" className='w-36 h-auto'/>
      </Link>  

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
      max-md:text-lg z-50 flex flex-col md:flex-row items-center
      max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
      md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
      border-gray-300/20 overflow-hidden transition-[width] duration-300 
      ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>

        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/'>Home</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/movies'>Movies</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/series'>TV Shows</Link>
        <Link onClick={()=> {scrollTo(0,0); setIsOpen(false)}} to='/discover'>Discover</Link>
      </div>

      <div className='flex items-center gap-8'>
        <div className="relative hidden md:flex items-center">
          <SearchIcon className="w-5 h-5 absolute left-2 text-gray-400"/>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder='Search...'
            className="bg-white/10 text-white placeholder:text-gray-400 pl-8 pr-4
            py-1.5 rounded-full focus:outline-none w-40 md:w-56"
          />
        </div>
        {
          !user ? (
            <button onClick={openSignIn} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary
            hover:bg-primary-dull transition rounded-full font-medium
            cursor-pointer'>Login</button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                label="Dashboard"
                labelIcon={<LayoutDashboard width={15} />}
                onClick={() => navigate('/dashboard')}
                />
                <UserButton.Action
                label="Progress"
                labelIcon={<LineChart width={15} />}
                onClick={() => navigate('/progress')}
                />
                <UserButton.Action 
                label="My watchlist" 
                labelIcon={<TicketPlus width={15}/>} 
                onClick={() => navigate('/watchlist')}
                />
              </UserButton.MenuItems>
            </UserButton>
          )
        }
        
      </div>

      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>

    </div>
  )
}

export default Navbar