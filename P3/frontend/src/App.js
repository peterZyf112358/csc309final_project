import './App.css';
import Search from './propSearch';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './profile';
import Reservation from "./Reservation/reservation_page";
import PropertyDetail from './property/propertyDetail';
import CreateProperty from './createProperty';
import UserContext from './context/userContext';
import UpdateProperty from './updateProperty';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(false);

  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
      <Router >
          <Routes>
            <Route exact path="/" element={<Search />} loading/>
            <Route path="/search" element={<Search />} loading/>
            <Route path="/profile/:userID" element={<Profile />} loading/>
            <Route path="/property/details/:id" element={<PropertyDetail />} loading/>
            <Route path="/reservation/" element={<Reservation />} lodaing/>
            <Route path="/property/create" element={<CreateProperty />} loading/>
            <Route path="/property/update/:propID" element={<UpdateProperty />} loading/>
          </Routes>
      </Router>
      </UserContext.Provider>
    </>
  );
}

export default App;
