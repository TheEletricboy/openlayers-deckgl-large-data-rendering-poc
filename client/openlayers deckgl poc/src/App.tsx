// ----------------------------
// File: src/App.tsx
// ----------------------------
import React from 'react';
import MapComponent from './components/Map';
import './App.css';


const App: React.FC = () => {
    // const [data, setData] = useState<Vessel[]>([]);

    // useEffect(() => {
    //     const ws = new WebSocket('ws://localhost:5005');

    //     ws.onmessage = event => {
    //         setData(JSON.parse(event.data));
    //     };

    //     return () => {
    //         ws.close();
    //     };
    // }, []);

    return (
        <div className='App'>
            <MapComponent />
            {/* <MapComponent data={data} /> */}
        </div>
    )
};

export default App;
