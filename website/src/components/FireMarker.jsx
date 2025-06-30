import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import fireIcon from '../assets/fireIcon.png'

const customIcon = new L.Icon({
  iconUrl: fireIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

const FireMarker = ({ position, data }) => {
  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <strong>Fire Incident</strong><br />
        <strong>Cause:</strong> {data.cause}<br />
        <strong>Date:</strong> {data.date}<br />
        <strong>Severity:</strong> {data.severity}
      </Popup>
    </Marker>
  )
}

export default FireMarker
