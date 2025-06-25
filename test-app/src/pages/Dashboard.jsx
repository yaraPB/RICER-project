import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router";

const incidentsData = [
  { id: 1, location: "Camping Farah", cause: "Man-made", description: "Fire near camp area", coords: [33.51432877479629, -5.134799896014312] },
  { id: 2, location: "Ifrane Airport", cause: "Lightning", description: "Lightning strike caused fire", coords: [33.50411, -5.15611] },
  { id: 3, location: "Park National d'Ifrane", cause: "Unknown", description: "Under investigation", coords: [33.529344, -5.101921] },
];

const incidentTrendData = [
  { day: "Mon", incidents: 3 },
  { day: "Tue", incidents: 5 },
  { day: "Wed", incidents: 2 },
  { day: "Thu", incidents: 4 },
  { day: "Fri", incidents: 6 },
  { day: "Sat", incidents: 3 },
  { day: "Sun", incidents: 4 },
];

const resourceUsageData = [
  { name: "Available", value: 60 },
  { name: "Deployed", value: 30 },
  { name: "Under Maintenance", value: 10 },
];

const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];

export default function Dashboard() {

  const navigate = useNavigate()

  return (
    <div className="min-h-screen  p-6 font-sans">
      <h1 className="text-4xl font-bold mb-6 text-red-700">Firefighter Emergency Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:scale-105 hover:cursor-pointer active:scale-100"
              onClick={() => navigate('/')}>
          <h2 className="text-2xl font-semibold mb-2 text-red-600" >Active Incidents</h2>
          <p className="text-5xl font-bold text-red-800">{incidentsData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:scale-105 hover:cursor-pointer active:scale-100"
              onClick={() => navigate('resources')}>
          <h2 className="text-2xl font-semibold mb-2 text-yellow-600">Response Teams</h2>
          <p className="text-5xl font-bold text-yellow-800">12</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:scale-105 hover:cursor-pointer active:scale-100"
          onClick={() => navigate('response-teams')}>
          <h2 className="text-2xl font-semibold mb-2 text-green-600">Resources Available</h2>
          <p className="text-5xl font-bold text-green-800">45</p>
        </div>
      </div>

      {/* Incident Map and List */}
      <div className="md:flex md:space-x-6 mb-8">
        <div className="md:w-2/3 h-96 rounded-lg shadow-lg overflow-hidden">
          <MapContainer
            center={[33.525835, -5.109813]}
            zoom={11}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
           <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
            attribution='&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            minZoom={0}
            maxZoom={20}
          />
            {incidentsData.map((inc) => (
              <Marker key={inc.id} position={inc.coords}>
                <Popup>
                  <strong>{inc.location}</strong>
                  <br />
                  Cause: {inc.cause}
                  <br />
                  {inc.description}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="md:w-1/3 mt-6 md:mt-0 bg-white rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Incident Reports</h2>
          <ul>
            {incidentsData.map((inc) => (
              <li key={inc.id} className="mb-4 border-b pb-2 last:border-none">
                <p className="font-semibold">{inc.location}</p>
                <p className="text-sm text-gray-600">Cause: {inc.cause}</p>
                <p className="text-sm">{inc.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Incident Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Incidents Over The Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incidentTrendData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#ef4444"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Resource Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={resourceUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
