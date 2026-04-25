import React from 'react';

export function usePro() {
  const [isPro, setIsPro] = React.useState(localStorage.getItem('pro_activated') === 'true');

  React.useEffect(() => {
    const handleProChange = (e: any) => {
      setIsPro(e.detail.isActivated);
    };

    window.addEventListener('proStatusChange', handleProChange as any);
    
    return () => window.removeEventListener('proStatusChange', handleProChange as any);
  }, []);

  return isPro;
}
