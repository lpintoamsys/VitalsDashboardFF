import { useState, useEffect } from 'react';
import VitalsTable from './pages/VitalsTable';


function App() {
  const [vitals, setVitals] = useState([]);

  // Fixed sorting function that handles undefined values safely
  const sortVitals = (vitalsList) => {
    if (!Array.isArray(vitalsList)) return [];
    
    return [...vitalsList].sort((a, b) => {
      const nameA = a && a.lastName ? a.lastName : '';
      const nameB = b && b.lastName ? b.lastName : '';
      return nameA.localeCompare(nameB);
    });
  };

  useEffect(() => {
    const fetchInitialVitals = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/vitals');
        const data = await response.json();
        setVitals([data]); // Wrap single object in array if needed
      } catch (error) {
        console.error('Error fetching initial vitals:', error);
      }
    };

    const setupSSE = () => {
      const eventSource = new EventSource('http://localhost:5001/api/vitals-stream');
      
      eventSource.onmessage = (event) => {
        try {
          const newVital = JSON.parse(event.data);
          setVitals(currentVitals => {
            // Make sure currentVitals is an array
            const currentVitalsArray = Array.isArray(currentVitals) ? currentVitals : [];
            // Add new vital and sort
            const updatedVitals = sortVitals([...currentVitalsArray, newVital]);
            // Keep only the latest 10 records
            return updatedVitals.slice(-10);
          });
        } catch (error) {
          console.error('Error processing SSE data:', error);
        }
      };

      eventSource.onerror = () => {
        console.log('SSE connection lost. Reconnecting...');
        eventSource.close();
        setTimeout(setupSSE, 5000);
      };

      return eventSource;
    };

    fetchInitialVitals();
    const eventSource = setupSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <div>
      <VitalsTable vitals={vitals} />
    </div>
  );
}

export default App;