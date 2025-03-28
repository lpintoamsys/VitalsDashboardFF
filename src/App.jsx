import { useState, useEffect } from 'react';
import VitalsTable from './pages/VitalsTable';

// API configuration constants
const API_CONFIG = {
  BASE_URL: 'http://localhost:5001',
  ENDPOINTS: {
    VITALS: '/api/vitals',
    VITALS_STREAM: '/api/vitals-stream'
  }
};


function App() {
  const [vitals, setVitals] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fixed sorting function that handles undefined values safely using optional chaining
  const sortVitals = (vitalsList) => {
    if (!Array.isArray(vitalsList)) return [];
    
    return [...vitalsList].sort((a, b) => {
      const nameA = a?.lastName ?? '';
      const nameB = b?.lastName ?? '';
      return nameA.localeCompare(nameB);
    });
  };

  useEffect(() => {
    const fetchInitialVitals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VITALS}`);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setVitals([data]); // Wrap single object in array if needed
      } catch (error) {
        console.error('Error fetching initial vitals:', error);
        setError(`Failed to load vitals data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    const setupSSE = () => {
      const eventSource = new EventSource(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VITALS_STREAM}`);
      
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

      eventSource.onerror = (event) => {
        console.log('SSE connection lost. Reconnecting...');
        setError('Real-time data connection lost. Attempting to reconnect...');
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

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
      <VitalsTable vitals={vitals} />
    </div>
  );
}

export default App;
