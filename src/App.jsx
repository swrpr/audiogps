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

        // Create a data array and a float array to store the audio data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const floatArray = new Float32Array(analyser.frequencyBinCount);

        // Start capturing the audio data
        const capture = () => {
          // Get the audio data
          analyser.getByteTimeDomainData(dataArray);

          // Convert the audio data to float data
          for (let i = 0; i < dataArray.length; i++) {
            floatArray[i] = (dataArray[i] - 128) / 128.0;
          }

          // Compute the RMS of the audio data
          let rms = 0;
          for (let i = 0; i < floatArray.length; i++) {
            rms += floatArray[i] * floatArray[i];
          }
          rms = Math.sqrt(rms / floatArray.length);

          // Compute the decibel level
          const decibelLevel = 20 * Math.log10(rms);

          // Update the state with the new decibel level
          setDecibelLevel(decibelLevel);
          setDecibelLevels([...decibelLevels, decibelLevel]);

          // Update the maximum decibel level
          if (decibelLevel > maxDecibelLevel) {
            setMaxDecibelLevel(decibelLevel);
          }
        };

        // Start capturing the audio data every 10 milliseconds
        const intervalId = setInterval(capture, 10);

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
  <div className="retro-container">
    <div className="decibel-level">Decibel Level: {decibelLevel.toFixed(2)} dB</div>
    <div className="max-decibel-level">Maximum Decibel Level: {maxDecibelLevel.toFixed(2)} dB</div>
    <button className="capture-button" onClick={handleCaptureClick}>
      <i className="fas fa-microphone-alt"></i>
      Capture
    </button>
    <div className="waveform">
      {decibelLevels.map((level, index) => (
        <div
          key={index}
          className="waveform-bar"
          style={{ height: `${level}%` }}
        ></div>
      ))}
    </div>
    <table className="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Decibel Level</th>
          <th>Max Decibel Level</th>
        </tr>
      </thead>
      <tbody>
        {history.map(measurement => (
          <tr key={measurement.date.toISOString()}>
            <td>{measurement.date.toLocaleString()}</td>
            <td>{measurement.latitude.toFixed(4)}</td>
            <td>{measurement.longitude.toFixed(4)}</td>
            <td>{measurement.decibelLevel.toFixed(2)} dB</td>
            <td>{measurement.maxDecibelLevel.toFixed(2)} dB</td>
          </tr>
        ))}
      </tbody>
    </table>
   <footer>
  <img src="" alt="" className="retro-image" />
  <a href="doc.x" className="retro-link">
    🔔🔇🛰️📍 ding dong lat long
  </a>
</footer>
</div>
);
}

export default App;
