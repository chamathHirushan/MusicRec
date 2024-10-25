import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaTimes } from "react-icons/fa";
import backgroundImage from '../assets/background.jpg';

const Trending = () => {
  const [trendingSongs, setTrendingSongs] = useState([]); // Trending songs from backend
  const [similarTracks, setSimilarTracks] = useState({}); // Similar tracks from backend
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [selectedSongId, setSelectedSongId] = useState(null); // Track which song's related songs to show
  const navigate = useNavigate();

  // Fetch trending songs from the backend
  useEffect(() => {
    axios.get('http://localhost:8001/populartracks') // Update with your actual URL
      .then(response => {
        setTrendingSongs(response.data);
      })
      .catch(error => {
        console.error("Error fetching trending songs:", error);
      });
  }, []);

  // Define multiple gradient options
  const gradients = [
    "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
    "bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500",
    "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300",
    "bg-gradient-to-r from-indigo-400 via-teal-500 to-purple-700",
  ];

  const handleSongClick = (trackId) => {
    const isLoggedIn = sessionStorage.getItem("userID");
    if (isLoggedIn) {
      navigate(`/song/${trackId}`);
    } else {
      navigate("/login");
    }
  };

  const handleRelatedSongClick = (trackId) => {
    const isLoggedIn = sessionStorage.getItem("userID");
    if (isLoggedIn) {
      navigate(`/song/${trackId}`);
    } else {
      navigate("/login");
    }
  };

  const openModal = (trackId) => {
    setSelectedSongId(trackId);
    setIsModalOpen(true);

    // Fetch similar tracks if not already fetched
    if (!similarTracks[trackId]) {
      axios.post(`http://localhost:8001/getsimilartrack/${trackId}`, { top_n: 2 })
        .then(response => {
          setSimilarTracks(prev => ({ ...prev, [trackId]: response.data.similar_tracks }));
        })
        .catch(error => {
          console.error("Error fetching similar tracks:", error);
        });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSongId(null);
  };

  const isLoggedIn = sessionStorage.getItem("userID");

  return (
    <div className="flex h-screen w-full overflow-hidden"
      style={{
        ...(isLoggedIn ? {} : {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
      }}
    >
      <div className="flex flex-col flex-1 p-6 rounded-3xl border m-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // White with 70% opacity; adjust last value for transparency
          backdropFilter: 'blur(10px)', // Adds a subtle blur for a glass effect
        }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-white">
          Trending Songs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {trendingSongs.map((song, index) => {
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            return (
              <div
                key={index}
                className={`trending-card p-6 rounded-lg shadow-lg relative ${randomGradient} transition-all duration-300 ease-in-out flex flex-col justify-between items-center text-center`}
                style={{ minHeight: '200px' }} // Optional: Set a minimum height
              >
                <h3 className="text-xl font-semibold text-white mb-1 overflow-hidden">
                  {song.track_name}
                </h3>
                <p className="text-gray-200 mb-4 overflow-hidden">
                  {song.artist} - {song.genre}
                </p>
                <div className="flex justify-center mb-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                    onClick={() => handleSongClick(song.track_id)}
                  >
                    <FaPlay />
                  </button>
                </div>
                <div className="text-xs text-white absolute bottom-2 left-0 right-0 ">
                  <button
                    className="hover:text-gray-300"
                    onClick={() => openModal(song.track_id)}
                  >
                    Related Songs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isModalOpen && selectedSongId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white bg-opacity-80 rounded-lg p-8 w-96 relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <FaTimes className="text-xl" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Related Songs</h2>
            <div className="flex flex-col space-y-4">
              {similarTracks[selectedSongId]?.map((relatedSong, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white rounded-lg shadow-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-gray-800 font-semibold">
                    {relatedSong.track_name}
                  </div>
                  <button
                    onClick={() => handleRelatedSongClick(relatedSong.track_id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaPlay className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trending;
