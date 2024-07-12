import React from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

function Denoiserfile() {
    const handleProcess = async() => {
        const ffmpeg = createFFmpeg({ log: true });
    
        await ffmpeg.load();
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select an audio file.');
            return;
        }
    
        const fileName = file.name;
        await ffmpeg.FS('writeFile', fileName, await fetchFile(file));
    
        // Adjust the path to correctly reference the model file in the public directory
        const rnnoiseModelPath = '/cb.rnnn'; // Corrected path to reference the public directory
        await ffmpeg.FS('writeFile', 'cb.rnnn', await fetchFile(rnnoiseModelPath));
    
        await ffmpeg.run('-i', fileName, '-af', 'arnndn=m=cb.rnnn', 'output.wav');
        const data = ffmpeg.FS('readFile', 'output.wav');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/wav' }));
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'output.wav';
        downloadLink.style.display = 'block';
        downloadLink.textContent = 'Download Processed File';
    }
  return (
    <>
    <div id="second-container">
      <input type="file" id="fileInput" accept="audio/*" />
      <button id="processButton" onClick={handleProcess}>Process</button>
      <a id="downloadLink" style={{display:"none"}}>
        Download Processed File
      </a>
    </div>
  </>
  )
}

export default Denoiserfile