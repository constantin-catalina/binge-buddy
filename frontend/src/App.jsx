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
import UserDashboard from './pages/UserDashboard'
import Progress from './pages/Progress'
import EditShows from './pages/admin/EditShows'
import EditUsers from './pages/admin/EditUsers'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShow from './pages/admin/AddShow'
import EditShow from './pages/admin/EditShow'
import AddUser from './pages/admin/AddUser'
import EditUser from './pages/admin/EditUser'

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
        <Route path="/dashboard" element={<UserDashboard/>}/>
        <Route path="/progress" element={<Progress/>}/>
        <Route path="/admin/*" element={<Layout/>}> 
          <Route index element={<Dashboard/>}/>
          <Route path="edit-shows" element={<EditShows/>}/>
          <Route path="add-show" element={<AddShow/>}/>
          <Route path="edit-shows/:id" element={<EditShow/>}/>
          <Route path="edit-users" element={<EditUsers/>}/>
          <Route path="add-user" element={<AddUser/>}/>
          <Route path="edit-users/:id" element={<EditUser/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App