import React from 'react'
import { LayersControl, LayerGroup} from 'react-leaflet'
import FireMarker from './FireMarker'
import Polygons from './Polygons'
import dataFile from '../assets/data-minimal.json'

const Layers = () => {

  return (
    <div>
    
    <LayersControl position="topright">

      <LayersControl.Overlay name="Current fires going on">
        <LayerGroup>
            <FireMarker position={[33.534229, -5.108965]} />
            <FireMarker position={[33.51996, -5.11819]} />
            <FireMarker position={[33.532035, -5.116341]} />
        </LayerGroup>
      </LayersControl.Overlay>
   
      <LayersControl.Overlay name="Safe Areas">
        <Polygons file={dataFile}/>
      </LayersControl.Overlay>


    </LayersControl>
    </div>
  )
}

export default Layers