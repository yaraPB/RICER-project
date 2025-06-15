import React from 'react'
import "leaflet/dist/leaflet.css"
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

const App = () => {

  const markers = [
    {
      geocode: [33.548221, -5.112304],
      popup: "Water Source - Ain Vitel"
    }, 
    {
      geocode: [33.51432877479629, -5.134799896014312],
      popup: "Camping Farah"
    }, 
    {
      geocode: [33.526176378695205, -5.117287759725861],
      popup: "Caserne de pompier"
    }, 
  ];

  const customIcons = new L.icon({
      iconUrl: "/forest-icon.png",
      iconSize: [38,38],
    })

  return (
    <div>

    <h1>Map for forest fire emergency management</h1>

      <MapContainer center={[33.53885457269134, -5.105985546821039]} zoom={15}>
        <TileLayer attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map( marker => (
              <Marker position={marker.geocode} icon={customIcons}>
                <Popup>{marker.popup}</Popup>
        </Marker>))}

      </MapContainer>

    </div>
  )
}

export default App