import React from 'react'
import fireIcon from '../assets/fireIcon.png'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

const FireMarker = ({ position }) => {

    const customIcon = new L.Icon({
    iconUrl: fireIcon, 
    iconSize: [48, 48], 
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    });

  return (
    <Marker position={position} icon={customIcon}>
        <Popup>There's a fire here</Popup>
    </Marker>
  )
}

export default FireMarker