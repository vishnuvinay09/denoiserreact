import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const getPauseCount = async (audioBlob) => {
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    await ffmpeg.FS('writeFile', 'input.wav', await fetchFile(audioBlob));

    let silenceStartCount = 0;
    ffmpeg.setLogger(({ type, message }) => {
        if (type === 'fferr' && message.includes('silence_start')) {
            silenceStartCount += 1;
        }
    });

    await ffmpeg.run('-i', 'input.wav', '-af', 'silencedetect=noise=-40dB:d=0.5', '-f', 'null', '/dev/null');

    return silenceStartCount;
};

export default getPauseCount;
