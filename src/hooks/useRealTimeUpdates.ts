import { useEffect, useRef } from 'react';

interface RealTimeUpdateHook {
  onKYCSubmitted?: (data: any) => void;
  onKYCStatusChanged?: (data: any) => void;
  onRequestSubmitted?: (data: any) => void;
  onRequestStatusChanged?: (data: any) => void;
}

export const useRealTimeUpdates = (callbacks: RealTimeUpdateHook) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Use Server-Sent Events (SSE) for real-time updates
    const eventSource = new EventSource(`${backendUrl}/api/admin/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Real-time connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'KYC_SUBMITTED':
            callbacks.onKYCSubmitted?.(data);
            break;
          case 'KYC_STATUS_CHANGED':
            callbacks.onKYCStatusChanged?.(data);
            break;
          case 'REQUEST_SUBMITTED':
            callbacks.onRequestSubmitted?.(data);
            break;
          case 'REQUEST_STATUS_CHANGED':
            callbacks.onRequestStatusChanged?.(data);
            break;
          default:
            console.log('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect...');
          // The useEffect will handle reconnection when component re-renders
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [backendUrl, callbacks]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    disconnect: () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
  };
};
