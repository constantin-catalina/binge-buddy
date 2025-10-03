import React, { use } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import { Route, Routes, useLocation } from 'react-router-dom'
import MovieDetails from './pages/MovieDetails'
import SeriesDetails from './pages/SeriesDetails'
import Movies from './pages/Movies'
import Series from './pages/Series'
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
        <Route path="/movies:id" element={<MovieDetails/>}/>
        <Route path="/series" element={<Series/>}/>
        <Route path="/series:id" element={<SeriesDetails/>}/>
        <Route path="/discover" element={<Discover/>}/>
      </Routes>
    </>
  )
}

export default App