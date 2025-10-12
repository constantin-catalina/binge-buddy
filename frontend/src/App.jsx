import React, { use } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import { Route, Routes, useLocation } from 'react-router-dom'
import Details from './pages/Details'
import Movies from './pages/Movies'
import Series from './pages/Series'
import MyWatchlist from './pages/MyWatchlist'
import { Toaster } from 'react-hot-toast'
import Discover from './pages/Discover'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin');

  return (
    <>
      <Toaster/>
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/movies" element={<Movies/>}/>
        <Route path="/movies/:id" element={<Details/>}/>
        <Route path="/series" element={<Series/>}/>
        <Route path="/series/:id" element={<Details/>}/>
        <Route path="/discover" element={<Discover/>}/>
        <Route path="/watchlist" element={<MyWatchlist/>}/>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App