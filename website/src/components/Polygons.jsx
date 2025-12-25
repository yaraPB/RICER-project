import React from 'react'
import { GeoJSON } from 'react-leaflet'

const Polygons = ({file}) => {
  return (
    
<GeoJSON
    data={file}
    style={{
    color: '#0000FF',
    weight: 2,
    fillColor: 'cornflowerblue',
    fillOpacity: 0.4
          }}
/>
  )
}

export default Polygons