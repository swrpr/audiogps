import React, { useState, useEffect } from 'react';

function App() {
  // Initialize the state variables
  const [decibelLevel, setDecibelLevel] = useState(0);
  const [maxDecibelLevel, setMaxDecibelLevel] = useState(0);
  const [history, setHistory] = useState([]);
  const [decibelLevels, setDecibelLevels] = useState([]);
 
  // Capture the audio from the microphone
  useEffect(() => {
    // Check if the microphone is available
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Request access to the microphone
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        // Create an audio context
        const audioContext = new AudioContext();

        // Create an audio source from the stream
        const audioSource = audioContext.createMediaStreamSource(stream);

        // Create an analyser
        const analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 2048;

        // Connect the audio source to the analyser
        audioSource.connect(analyser);

        // Create a data array to store the audio data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Start capturing the audio data
        const capture = () => {
          // Get the audio data
          analyser.getByteFrequencyData(dataArray);

          // Find the maximum decibel value in the data array
          const maxDecibel = Math.max(...dataArray);

          // Compute the decibel level
          const decibelLevel = maxDecibel - 128;

          // Update the state with the new decibel level
          setDecibelLevel(decibelLevel);
          setDecibelLevels([...decibelLevels, decibelLevel]);

          // Update the maximum decibel level
          if (decibelLevel > maxDecibelLevel) {
            setMaxDecibelLevel(decibelLevel);
          }
        };

        // Start capturing the audio data every 1000 milliseconds
        const intervalId = setInterval(capture, 1000);

        // Stop capturing the audio data when the component unmounts
        return () => clearInterval(intervalId);
      });
    }
  }, []);

  // Function to handle the "Capture" button click
  const handleCaptureClick = () => {
    // Calculate the average decibel level for the 10 second data
    const sum = decibelLevels.reduce((acc, val) => acc + val, 0);
    const avgDecibelLevel = sum / decibelLevels.length;

    // Reset the decibel levels array
    setDecibelLevels([]);

    // Capture the GPS location and add a new measurement to the history
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const measurement = {
          date: new Date(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          decibelLevel: avgDecibelLevel,
          maxDecibelLevel: maxDecibelLevel
        };
        setHistory([...history, measurement]);
      });
    }
  };

 return (
  <div style={{ background: 'black', color: 'lime' }}>
    <div style={{ fontSize: '12px' }}>🔉 Decibel Level: {decibelLevel.toFixed(2)} dB</div>
    <div style={{ fontSize: '12px' }}>🔊 Maximum Decibel Level: {maxDecibelLevel.toFixed(2)} dB</div>
    <button style={{ fontSize: '12px', background: 'lime', color: 'black' }} onClick={handleCaptureClick}>📢 Capture</button>
    
    <table style={{ border: '1px solid lime' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid lime', fontSize: '12px' }}>Date</th>
          <th style={{ border: '1px solid lime', fontSize: '12px' }}>Latitude</th>
          <th style={{ border: '1px solid lime', fontSize: '12px' }}>Longitude</th>
          <th style={{ border: '1px solid lime', fontSize: '12px' }}>Decibel Level</th>
          <th style={{ border: '1px solid lime', fontSize: '12px' }}>Max Decibel Level</th>
        </tr>
      </thead>
      <tbody>
        {history.map(measurement => (
          <tr key={measurement.date.toISOString()}>
            <td style={{ border: '1px solid lime', fontSize: '12px' }}>{measurement.date.toLocaleString()}</td>
            <td style={{ border: '1px solid lime', fontSize: '12px' }}>{measurement.latitude.toFixed(4)}</td>
            <td style={{ border: '1px solid lime', fontSize: '12px' }}>{measurement.longitude.toFixed(4)}</td>
            <td style={{ border: '1px solid lime', fontSize: '12px' }}>{measurement.decibelLevel.toFixed(2)} dB</td>
            <td style={{ border: '1px solid lime', fontSize: '12px' }}>{measurement.maxDecibelLevel.toFixed(2)} dB</td>
          </tr>
        ))}
      </tbody>
    </table>
    <footer style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', background: '#960024', color: '#FFFFFF', fontSize: '10px', fontFamily: 'Courier New, monospace', padding: '8px' }}>
  <a href="https://docs.google.com/document/d/1X8ZxuhIGq0xvETFZUjEZYRVYMGHZOzM_RG3UG4Lsit8/edit?usp=sharing" style={{ color: '#FFFFFF', textDecoration: 'u' }}>🔔🔇🛰️📍 ding dong lat long</a>
</footer>
  </div>
);

}

export default App;