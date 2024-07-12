// import React from 'react'
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// function Denoiser() {
    // const handleProcess = async() => {
    //     const ffmpeg = createFFmpeg({ log: true });
    
    //     await ffmpeg.load();
    //     const fileInput = document.getElementById('fileInput');
    //     const file = fileInput.files[0];
    //     if (!file) {
    //         alert('Please select an audio file.');
    //         return;
    //     }
    
    //     const fileName = file.name;
    //     await ffmpeg.FS('writeFile', fileName, await fetchFile(file));
    
    //     // Adjust the path to correctly reference the model file in the public directory
    //     const rnnoiseModelPath = '/cb.rnnn'; // Corrected path to reference the public directory
    //     await ffmpeg.FS('writeFile', 'cb.rnnn', await fetchFile(rnnoiseModelPath));
    
    //     await ffmpeg.run('-i', fileName, '-af', 'arnndn=m=cb.rnnn', 'output.wav');
    //     const data = ffmpeg.FS('readFile', 'output.wav');
    //     const url = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/wav' }));
    //     const downloadLink = document.getElementById('downloadLink');
    //     downloadLink.href = url;
    //     downloadLink.download = 'output.wav';
    //     downloadLink.style.display = 'block';
    //     downloadLink.textContent = 'Download Processed File';
//       }
//   return (
//     <>
//     <div id="second-container">
//       <input type="file" id="fileInput" accept="audio/*" />
//       <button id="processButton" onClick={handleProcess}>Process</button>
//       <a id="downloadLink" style={{display:"none"}}>
//         Download Processed File
//       </a>
//     </div>
//   </>
//   )
// }

// export default Denoiser

import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

function Denoiser() {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [denoisedUrl, setDenoisedUrl] = useState(null);

    const handleStartRecording = () => {
        if (mediaRecorder) {
            setRecordedChunks([]);
            mediaRecorder.start();
            setRecording(true);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);
                    recorder.addEventListener('dataavailable', event => {
                        if (event.data.size > 0) {
                            setRecordedChunks(prev => [...prev, event.data]);
                        }
                    });
                    recorder.start();
                    setRecording(true);
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const handleProcess = async () => {
        const ffmpeg = createFFmpeg({ log: true });

        await ffmpeg.load();
        
        // Convert recorded audio chunks to a single blob
        const recordedBlob = new Blob(recordedChunks);
        setRecordedUrl(URL.createObjectURL(recordedBlob));
        await ffmpeg.FS('writeFile', 'recorded.webm', await fetchFile(recordedBlob));
        
        // Adjust the path to correctly reference the model file in the public directory
        const rnnoiseModelPath = '/cb.rnnn'; // Corrected path to reference the public directory
        await ffmpeg.FS('writeFile', 'cb.rnnn', await fetchFile(rnnoiseModelPath));

        await ffmpeg.run('-i', 'recorded.webm', '-af', 'arnndn=m=cb.rnnn', 'output.wav');
        const data = ffmpeg.FS('readFile', 'output.wav');
        const denoisedUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/wav' }));
        
        setDenoisedUrl(denoisedUrl);
    };

    return (
        <>
            <div id="second-container">
                <button onClick={recording ? handleStopRecording : handleStartRecording}>
                    {recording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button id="processButton" onClick={handleProcess} disabled={!recordedChunks.length}>
                    Process
                </button>
            </div>
            
            {recordedUrl && (
                <div>
                    <h3>Recorded Audio</h3>
                    <audio controls>
                        <source src={recordedUrl} type="audio/webm" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            {denoisedUrl && (
                <div>
                    <h3>Denoised Audio</h3>
                    <audio controls>
                        <source src={denoisedUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </>
    );
}

export default Denoiser;
