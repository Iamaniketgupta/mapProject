import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pilotsData from '../data/data.js';
import icon from '../assets/icon.png';
import icon2 from '../assets/icon2.png';

const Home = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const userIcon = L.icon({
        iconUrl: icon,
        iconSize: [40, 40],
        iconAnchor: [15, 30],
    });

    const pilotIcon = L.icon({
        iconUrl: icon2,
        iconSize: [40, 40],
        iconAnchor: [15, 30],
    });

    return (
        <div className="relative">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <div className="my-3 p-2">
                <button className="border-2 border-blue-500 bg-blue-500 text-white font-white font-bold p-2 mx-3 rounded-lg " onClick={fetchUserLocation}>Locate</button>
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
                    {pilotsData.map((pilot, index) => (
                        <Marker
                            key={index}
                            position={[parseFloat(pilot.coordinates.latitude), parseFloat(pilot.coordinates.longitude)]}
                            icon={pilotIcon} // Use pilotIcon for pilots markers
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
