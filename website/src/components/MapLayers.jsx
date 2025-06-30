import React from 'react'
import { LayersControl, LayerGroup } from 'react-leaflet'
import FireMarker from './FireMarker'
import Polygons from './Polygons'
import dataFile from '../assets/fire-regions.json'
import fireIncidents from '../assets/fire-incidents.json' // import the new data

const MapLayers = () => {
  return (
    <div>
      <LayersControl position="topright">

        <LayersControl.Overlay name="Current fires going on" checked>
          <LayerGroup>
            {fireIncidents.map((fire) => (
              <FireMarker
                key={fire.id}
                position={fire.position}
                data={fire} // pass full data to marker (optional)
              />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Safe Areas" checked>
          <Polygons file={dataFile} />
        </LayersControl.Overlay>

      </LayersControl>
    </div>
  )
}

export default MapLayers
