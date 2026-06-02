import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure gtag is defined on the window object (which is loaded via index.html)
    if (window.gtag) {
      window.gtag('config', 'G-8803TMS2G8', {
        page_path: location.pathname + location.search,
        page_title: document.title || 'Ottobon Jobs',
      });
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;
