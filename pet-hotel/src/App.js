import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import NavigationBar from './components/Navbar';
import Home from './components/Home';
import Services from './components/Services';
import Booking from './components/Booking';
import GroomingServices from './components/GroomingServices';
import GroomingReservation from './components/GroomingReservation';
import OvernightReservation from './components/OvernightReservation';
import Confirmation from './components/Confirmation';
import AdminBookingList from './components/AdminBookingList';
import ChatbotButton from './components/ChatbotButton';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/grooming-services" element={<GroomingServices />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/grooming-reservation" element={<GroomingReservation />} />
          <Route path="/overnight-reservation" element={<OvernightReservation />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/admin/bookings" element={<AdminBookingList />} />
        </Routes>
        <ChatbotButton />
      </div>
    </Router>
  );
}

export default App;
