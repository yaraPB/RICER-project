import React from 'react'
import fireIcon from '../assets/fireIcon.png'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

const FireMarker = ({ position }) => {

    const customIcon = new L.Icon({
    iconUrl: fireIcon, // Path to your icon image
    iconSize: [48, 48], // Size of the icon [width, height]
    iconAnchor: [16, 32], // Point of the icon corresponding to the marker's location
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
    });

  return (
    <Marker position={position} icon={customIcon}>
        <Popup>There's a fire here</Popup>
    </Marker>
  )
}

export default FireMarker