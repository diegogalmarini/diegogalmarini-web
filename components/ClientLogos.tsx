import React, { useState, useEffect, ElementType } from 'react';

interface Logo {
  name: string;
  icon: ElementType;
}

// Logo item with fade effects and consistent sizing for real logos
const LogoItem: React.FC<{ logo: Logo; index: number; isVisible: boolean }> = ({ logo, index, isVisible }) => {
  // Consistent size for all real client logos
  const logoSize = {
    height: '60px',
    maxWidth: '140px'
  };
  
  return (
    <div
      className={`flex items-center justify-center p-3 transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-70' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
      aria-label={logo.name}
    >
      <logo.icon 
        className="object-contain text-[var(--text-color)] transition-all duration-300" 
        style={{ 
          height: logoSize.height,
          width: 'auto',
          maxWidth: logoSize.maxWidth,
          opacity: isVisible ? 0.7 : 0
        }} 
      />
    </div>
  );
};

export const ClientLogos: React.FC = () => {
  const [realClientLogos, setRealClientLogos] = useState<Logo[]>([]);
  const [displayedLogos, setDisplayedLogos] = useState<Logo[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<boolean[]>([]);

  // Load only real client logos from public folder
  useEffect(() => {
    const loadRealLogos = async () => {
      const logoExtensions = ['svg', 'png', 'webp', 'jpg', 'jpeg'];
      const realLogos: Logo[] = [];
      
      // Try to load real client logos (cliente01, cliente02, etc.)
      for (let i = 1; i <= 30; i++) {
        const clientNumber = i.toString().padStart(2, '0');
        
        for (const ext of logoExtensions) {
          try {
            const logoPath = `/client-logos/cliente${clientNumber}.${ext}`;
            const response = await fetch(logoPath, { method: 'HEAD' });
            
            if (response.ok) {
              // Create a component function for the real logo
              const LogoComponent: React.FC<any> = (props) => (
                <img 
                  {...props}
                  src={logoPath} 
                  alt={`Logo cliente ${clientNumber}`}
                  style={{ 
                    ...props.style,
                    objectFit: 'contain',
                    filter: 'grayscale(100%) brightness(0.4)'
                  }}
                />
              );
              
              realLogos.push({
                name: `Logo ${clientNumber}`,
                icon: LogoComponent
              });
              break; // Found logo, stop checking other extensions
            }
          } catch (error) {
            // Logo doesn't exist, continue
          }
        }
      }
      
      setRealClientLogos(realLogos);
    };
    
    loadRealLogos();
  }, []);

  // Initialize with 12 real logos when available
  useEffect(() => {
    if (realClientLogos.length > 0) {
      const shuffled = [...realClientLogos].sort(() => Math.random() - 0.5);
      const initialLogos = shuffled.slice(0, Math.min(12, realClientLogos.length));
      setDisplayedLogos(initialLogos);
      setVisibilityMap(new Array(12).fill(true));
    }
  }, [realClientLogos]);

  // Random logo rotation every 3 seconds
  useEffect(() => {
    if (displayedLogos.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random position to change (0-11 for 12 positions)
      const randomIndex = Math.floor(Math.random() * 12);
      
      // Fade out the current logo
      setVisibilityMap(prev => {
        const newMap = [...prev];
        newMap[randomIndex] = false;
        return newMap;
      });

      // After fade out, change logo and fade in
      setTimeout(() => {
        const availableLogos = realClientLogos.filter(logo => 
          !displayedLogos.some(displayed => displayed.name === logo.name)
        );
        
        if (availableLogos.length > 0) {
          const randomLogo = availableLogos[Math.floor(Math.random() * availableLogos.length)];
          
          setDisplayedLogos(prev => {
            const newLogos = [...prev];
            newLogos[randomIndex] = randomLogo;
            return newLogos;
          });
        }

        // Fade in the new logo
        setTimeout(() => {
          setVisibilityMap(prev => {
            const newMap = [...prev];
            newMap[randomIndex] = true;
            return newMap;
          });
        }, 100);
      }, 500); // Wait for fade out to complete
    }, 3000);

    return () => clearInterval(interval);
  }, [displayedLogos]);

  if (displayedLogos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-muted)] text-lg">
          {realClientLogos.length === 0 ? 'Cargando logos de clientes...' : 'No hay logos disponibles'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      {/* First row - 7 logos */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {displayedLogos.slice(0, 7).map((logo, index) => (
          <LogoItem 
            key={`${logo.name}-top-${index}`} 
            logo={logo} 
            index={index} 
            isVisible={visibilityMap[index] || false}
          />
        ))}
      </div>
      
      {/* Second row - 5 logos centered */}
      <div className="flex items-center justify-center gap-8">
        {displayedLogos.slice(7, 12).map((logo, index) => (
          <LogoItem 
            key={`${logo.name}-bottom-${index}`} 
            logo={logo} 
            index={index + 7} 
            isVisible={visibilityMap[index + 7] || false}
          />
        ))}
      </div>
    </div>
  );
};
