
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Venue, User } from '../types';
import { GoogleGenAI } from "@google/genai";

const venueIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991231.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface MapScreenProps {
  venues: Venue[];
  user: User;
  onScanPrompt: (venue: Venue) => void;
}

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
};

const MapScreen: React.FC<MapScreenProps> = ({ venues, user, onScanPrompt }) => {
  const [userPos, setUserPos] = useState<[number, number]>([29.9511, -90.0715]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState<{title: string, uri: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user.locationSharing) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user.locationSharing]);

  const handleIntelSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setSearchLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: searchQuery,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: { retrievalConfig: { latLng: { latitude: userPos[0], longitude: userPos[1] } } }
        }
      });
      
      setSearchResult(response.text || "No intelligence found.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
      setSearchLinks(links);
    } catch (e) {
      setSearchResult("Sensor failure. Intelligence link severed.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-3 pointer-events-none">
        {/* Intelligence Search Bar */}
        <div className="bg-[#0a0a0a]/90 border border-[#39ff14]/50 rounded-lg p-2 flex flex-col pointer-events-auto shadow-lg shadow-[#39ff14]/10">
          <div className="flex gap-2">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Bayou Intel..."
              className="flex-1 bg-transparent border-none text-xs neon-green placeholder:text-green-900/50 focus:outline-none"
            />
            <button onClick={handleIntelSearch} disabled={isSearching} className="text-sm">
              {isSearching ? '⏳' : '📡'}
            </button>
          </div>
          {searchResult && (
            <div className="mt-2 text-[10px] text-gray-300 max-h-24 overflow-y-auto border-t border-gray-800 pt-2 font-serif italic">
              {searchResult}
              {searchLinks.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[9px] font-bold text-[#39ff14] uppercase">Ground Intel Found:</p>
                  {searchLinks.map((l, i) => (
                    <a key={i} href={l.uri} target="_blank" className="block text-blue-400 underline truncate">{l.title}</a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MapContainer center={userPos} zoom={15} className="h-full w-full" zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
        {user.locationSharing && <Marker position={userPos} icon={userIcon}><Popup>User Unit</Popup></Marker>}
        {venues.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={venueIcon}>
            <Popup>
              <div className="p-2 text-[#0a0a0a]">
                <h3 className="font-bold">{v.name}</h3>
                <p className="text-xs">Tier {v.tier} Venue</p>
                <button onClick={() => onScanPrompt(v)} className="mt-2 bg-[#bf00ff] text-white px-3 py-1 rounded text-xs uppercase">Scan Tag</button>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater center={userPos} />
      </MapContainer>
    </div>
  );
};

export default MapScreen;
