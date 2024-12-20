import {useState} from 'react'
import {  Route, Routes, Navigate } from 'react-router-dom';


import Foryou from './components/Foryou'
import Trending from './components/Trending'
import Chatbot from './components/Chatbot'
import Loginpage from './components/Loginpage'
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RegisterPage from './components/Registerpage';
import Profile from './components/Profile';
import Preferences from './components/Preferences';
import Song from './components/Song';
import Recommendations from './components/Recommendations';
import AddSong from './components/Addsong';
//import Trending2 from './components/Trending2';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    
      <div>
        <Topbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <div className="main-content flex">
          {isLoggedIn && <Sidebar />}
          <div className="content-area flex-1">
            <Routes>
              <Route path="/" element={<Trending />} />
              <Route path="/login" element={<Loginpage onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterPage />} />

              {isLoggedIn ? (
                <>
                  <Route path="/foryou" element={<Foryou />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/song/:trackId" element={<Song />} />
                  <Route path="/addsong" element={<AddSong />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                </>
              ) : (
                <>
                  <Route path="/foryou" element={<Navigate to="/login" />} />
                  <Route path="/chatbot" element={<Navigate to="/login" />} />
                  <Route path="/profile" element={<Navigate to="/login" />} />
                  <Route path="/preferences" element={<Navigate to="/login" />} />
                  <Route path="/song/:trackId" element={<Navigate to="/login" />} />
                  <Route path="/addsong" element={<Navigate to="/login" />} />
                  <Route path="/recommendations" element={<Navigate to="/login" />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      </div>
      
                
              )}

export default App