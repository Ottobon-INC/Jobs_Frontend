import React from 'react';
import './LogoMarquee.css';

const COMPANY_LOGOS = [
  { name: 'Accenture', src: '/logos/accenture.svg' },
  { name: 'Adobe', src: '/logos/adobe.png' },
  { name: 'Amazon', src: '/logos/amazon.svg' },
  { name: 'Apple', src: '/logos/apple.svg' },
  { name: 'Google', src: '/logos/google.svg' },
  { name: 'Microsoft', src: '/logos/microsoft.svg' },
  { name: 'Meta', src: '/logos/meta.svg' },
  { name: 'Nvidia', src: '/logos/nvidia.svg' },
  { name: 'OpenAI', src: '/logos/openai.svg' },
  { name: 'Salesforce', src: '/logos/salesforce.svg' },
  { name: 'Samsung', src: '/logos/samsung-research.png' },
  { name: 'TCS', src: '/logos/tcs.svg' },
  { name: 'Wipro', src: '/logos/wipro.svg' },
  { name: 'Infosys', src: '/logos/infosys.svg' },
  { name: 'IBM', src: '/logos/ibm.svg' },
  { name: 'Oracle', src: '/logos/oracle.svg' },
  { name: 'Palantir', src: '/logos/palantir.svg' },
];

const LogoMarquee = () => {
  // Duplicate logos for seamless loop
  const displayLogos = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

  return (
    <section className="trust-bar">
      <h2>Find Jobs From Sources</h2>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {displayLogos.map((logo, index) => (
            <div key={`${logo.name}-${index}`} className="marquee-logo-container">
              <img 
                src={logo.src} 
                alt={`${logo.name} logo`} 
                className="marquee-logo"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
