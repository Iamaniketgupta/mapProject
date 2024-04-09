import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pilotsData from '../data/data.js';
import icon from '../assets/icon.png';

const Home = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projectLocation, setProjectLocation] = useState({ latitude: null, longitude: null });
    const [nearbyPilots, setNearbyPilots] = useState([]);

    useEffect(() => {
        fetchUserLocation();
    }, []);

    const fetchUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLoading(false);
                },
                (error) => {
                    setError("Error fetching user location. Please ensure your internet connection is on.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const handleLocatorClick = () => {
        setLoading(true);
        setError(null);

        fetchUserLocation();
    };

    const calculateDistance = (coord1, coord2) => {
        const R = 6371; // Radius of the Earth in km
        const lat1 = coord1.latitude;
        const lon1 = coord1.longitude;
        const lat2 = coord2.latitude;
        const lon2 = coord2.longitude;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    };
    const handleLatitudeChange = (e) => {
        const latitude = parseFloat(e.target.value);
        setProjectLocation((prevLocation) => ({
            ...prevLocation,
            latitude: isNaN(latitude) ? null : latitude, // Set latitude to null if input is not a valid number
        }));
    };
    
    const handleLongitudeChange = (e) => {
        const longitude = parseFloat(e.target.value);
        setProjectLocation((prevLocation) => ({
            ...prevLocation,
            longitude: isNaN(longitude) ? null : longitude, // Set longitude to null if input is not a valid number
        }));
    };
    
    useEffect(() => {
        if (userLocation && projectLocation.latitude !== null && projectLocation.longitude !== null) {
            const nearbyPilots = pilotsData.filter(pilot => {
                const distance = calculateDistance(projectLocation, pilot.coordinates);
                return distance <= 10;
            });
            setNearbyPilots(nearbyPilots);
        }
    }, [userLocation, projectLocation]);

    const userIcon = L.icon({
        iconUrl: icon,
        iconSize: [40, 40],
        iconAnchor: [15, 30],
    });

    return (
        <div className="relative">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <div className="my-3 p-2">
                <input
                    className="border-2 border-blue-500 p-2 mx-3 rounded-lg"
                    type="text"
                    placeholder="Enter Latitude"
                    value={projectLocation.latitude || ''}
                    onChange={handleLatitudeChange}
                />
                <input
                    className="border-2 border-blue-500 p-2 mx-3 rounded-lg"
                    type="text"
                    placeholder="Enter Longitude"
                    value={projectLocation.longitude || ''}
                    onChange={handleLongitudeChange}
                />
                <button className="border-2 border-blue-500 bg-blue-500 text-white font-white font-bold p-2 mx-3 rounded-lg " onClick={handleLocatorClick}>Locate</button>
            </div>
            {userLocation && (
                <MapContainer
                    center={[userLocation.latitude, userLocation.longitude]}
                    zoom={12}
                    style={{ height: "500px", width: "100%", margin: "auto auto" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                        <Popup>
                            <div>
                                <h3>Your Location</h3>
                                <p>Latitude: {userLocation.latitude}</p>
                                <p>Longitude: {userLocation.longitude}</p>
                            </div>
                        </Popup>
                    </Marker>
                    {nearbyPilots.map((pilot, index) => (
                        <Marker
                            key={index}
                            position={[parseFloat(pilot.coordinates.latitude), parseFloat(pilot.coordinates.longitude)]}
                        >
                            <Popup>
                                <div>
                                    <h3>{pilot.name}</h3>
                                    <p>Contact: {pilot.contact}</p>
                                    <p>Availability: {pilot.availability}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
};

export default Home;
