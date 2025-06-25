import './App.css'
import Map from './components/Map'

function App() {

  return (
    <div>
      <Map/>
      <button
      className='p-2 bg-red-200 m-2 rounded-2xl'
      >Click here to add a marker</button>
    </div>
  )
}

export default App
