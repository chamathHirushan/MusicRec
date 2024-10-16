import React from 'react';
import Recommended from './Recommended';
import Trending from './Trending';
import Chatbot from './Chatbot';

const Foryou = () => {

  
  return (
    <div className="flex flex-col h-screen">
      {/* <Topbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} /> */}
      

      {/* Main Content */}
      <div className="flex flex-1 p-4">
        {/* Trending Songs Section */}
        <div className="w-1/2 p-4">
        {/*<h2 className="text-2xl font-bold mb-4">Trending Songs</h2> */}
          <Trending />
        </div>

        {/* For You Section */}
        <div className="w-1/2 p-4">
        {/*<h2 className="text-2xl font-bold mb-4">Trending Songs</h2> */}          {/* Add specific content or components for "For You" section here */}
          {/*<div className="p-4 bg-gray-200 rounded-lg">
            <p>Your personalized music recommendations will appear here.</p>
          </div>*/}
          <Recommended />
        </div>
      </div>

      {/* Chatbot Section */}
      <Chatbot />
    </div>
  );
};

export default Foryou;
