import { useState, useEffect } from 'react';
import { getRandomGif } from '../gifs';

export default function GifBackground({ children }) {
  const [gif, setGif] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setGif(getRandomGif());
  }, []);

  return (
    <div className="min-h-screen relative">
      {gif && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20"
            style={{ backgroundImage: `url(${gif})` }}
          />
          <div className="fixed inset-0 bg-black/60 -z-10" />
        </>
      )}
      {!gif && <div className="fixed inset-0 bg-gray-900 -z-10" />}
      {children}
    </div>
  );
}
