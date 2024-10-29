const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const { nms } = require('./server');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); 

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

nms.run();

let ffmpegProcess;

// Set RTMP server URL and stream key
const streamUrl = 'rtmp://3.110.92.32:1935/live';
const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942';

let liveUsers = [];


app.get('/start-stream', (req, res) => {

    // const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Adjust this path as necessary
    const ffmpegPath = '/usr/bin/ffmpeg'; // Adjust this path as necessary
    if (!ffmpegProcess) {
        ffmpegProcess = spawn(ffmpegPath, [
            '-re', // Read input at native frame rate
            '-f', 'dshow',
            '-i', 'video=USB2.0 HD UVC WebCam', // Input file
            '-f', 'dshow',
            '-i', 'audio=Microphone (Realtek(R) Audio)',
            '-c:v', 'libx264', // Video codec
            '-preset', 'veryfast', // Preset for encoding speed
            '-b:v', '3000k', // Bitrate
            '-maxrate', '3000k',
            '-bufsize', '6000k',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', // Audio codec
            '-b:a', '128k', // Audio bitrate
            '-ar', '44100', // Audio sample rate
            '-f', 'flv', // Output format for RTMP
            `${streamUrl}/${streamKey}`, // Full RTMP URL
        ]);

        ffmpegProcess.stdout.on('data', (data) => {
            console.log(`FFmpeg output: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`FFmpeg error: ${data}`);
        });


        ffmpegProcess.on('close', (code) => {
            console.log(`FFmpeg process exited with code ${code}`);
            ffmpegProcess = null;
        });

        // Respond with JSON
        res.json({ message: 'Streaming started.' });
    } else {
        res.json({ message: 'Stream is already running.' });
    }
});

app.get('/stop-stream', (req, res) => {
    if (ffmpegProcess) {
        ffmpegProcess.kill();
        ffmpegProcess = null;
        res.json({ message: 'Streaming stopped.' });
    } else {
        res.json({ message: 'No streaming process to stop.' });
    }
});

app.get('/view-stream', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live_streaming.html'));
});

// Optional: Handle favicon requests to avoid 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

app.listen(3000, () => {
    console.log('Live streaming API is running on http://3.110.92.32:3000');
});


























// // ------------------------------ TEST#2 -------------------------------------

// const express = require('express');
// const { spawn } = require('child_process');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json()); // Middleware to parse JSON request body
// let ffmpegProcess;

// // Set RTMP server URL and stream key
// const streamUrl = 'rtmp://192.168.0.100:1935/live';
// const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942';

// app.post('/start-stream', (req, res) => {
//     const { videoSource, audioSource } = req.body;

//     if (!videoSource || !audioSource) {
//         return res.status(400).json({ message: 'Video and audio sources are required.' });
//     }

//     if (!ffmpegProcess) {
//         ffmpegProcess = spawn('ffmpeg', [
//             '-re', // Read input at native frame rate
//             '-f', 'dshow',
//             '-i', `video=${videoSource}`, // Input video source
//             '-f', 'dshow',
//             '-i', `audio=${audioSource}`, // Input audio source
//             '-c:v', 'libx264', // Video codec
//             '-preset', 'veryfast', // Preset for encoding speed
//             '-b:v', '3000k', // Bitrate
//             '-maxrate', '3000k',
//             '-bufsize', '6000k',
//             '-pix_fmt', 'yuv420p',
//             '-c:a', 'aac', // Audio codec
//             '-b:a', '128k', // Audio bitrate
//             '-ar', '44100', // Audio sample rate
//             '-f', 'flv', // Output format for RTMP
//             `${streamUrl}/${streamKey}`, // Full RTMP URL
//         ]);

//         ffmpegProcess.stdout.on('data', (data) => {
//             console.log(`FFmpeg output: ${data}`);
//         });

//         ffmpegProcess.stderr.on('data', (data) => {
//             console.error(`FFmpeg error: ${data}`);
//         });

//         ffmpegProcess.on('close', (code) => {
//             console.log(`FFmpeg process exited with code ${code}`);
//             ffmpegProcess = null;
//         });

//         res.json({ message: 'Streaming started.' });
//     } else {
//         res.json({ message: 'Stream is already running.' });
//     }
// });

// app.get('/stop-stream', (req, res) => {
//     if (ffmpegProcess) {
//         ffmpegProcess.kill();
//         ffmpegProcess = null;
//         res.json({ message: 'Streaming stopped.' });
//     } else {
//         res.json({ message: 'No streaming process to stop.' });
//     }
// });

// // Optional: Handle favicon requests to avoid 404 errors
// app.get('/favicon.ico', (req, res) => {
//     res.status(204).end(); // No content
// });

// app.listen(3000, () => {
//     console.log('Live streaming API is running on http://192.168.0.100:3000');
// });



// // const express = require('express');
// // const { spawn } = require('child_process');
// // const cors = require('cors');

// // const app = express();
// // app.use(cors());
// // let ffmpegProcess;

// // app.get('/start-stream', (req, res) => {
// //     if (!ffmpegProcess) {
// //         ffmpegProcess = spawn('ffmpeg', [
// //             '-f', 'dshow',
// //             '-i', 'video=HP TrueVision HD Camera',
// //             '-f', 'dshow',
// //             '-i', 'audio=Microphone Array (Intel® Smart Sound Technology for Digital Microphones)',
// //             '-video_size', '640x480',
// //             '-framerate', '30',
// //             '-c:v', 'libx264',
// //             '-preset', 'ultrafast',
// //             '-tune', 'zerolatency',
// //             '-c:a', 'aac',
// //             '-b:a', '128k',
// //             '-f', 'flv',
// //             'rtmp://192.168.0.100:1935/live/da373f55-034e-4ac1-8d1d-c5ac03190942'
// //         ]);

// //         ffmpegProcess.stdout.on('data', (data) => {
// //             console.log(`FFmpeg output: ${data}`);
// //         });

// //         ffmpegProcess.stderr.on('data', (data) => {
// //             console.error(`FFmpeg error: ${data}`);
// //         });

// //         ffmpegProcess.on('close', (code) => {
// //             console.log(`FFmpeg process exited with code ${code}`);
// //             ffmpegProcess = null;
// //         });

// //         res.send('Streaming started.');
// //     } else {
// //         res.send('Stream is already running.');
// //     }
// // });

// // app.get('/stop-stream', (req, res) => {
// //     if (ffmpegProcess) {
// //         ffmpegProcess.kill();
// //         ffmpegProcess = null;
// //         res.send('Streaming stopped.');
// //     } else {
// //         res.send('No streaming process to stop.');
// //     }
// // });

// // app.listen(3000, () => {
// //     console.log('Live streaming API is running on http://192.168.0.100:3000');
// // });



// // ----------------------------------- TEST#1 ---------------------------------------

// const { spawn } = require('child_process');

// // Set RTMP server URL and stream key
// const streamUrl = 'rtmp://192.168.0.100:1935/live';
// const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942';

// // FFmpeg command for streaming
// const ffmpeg = spawn('ffmpeg', [
//   '-re', // Read input at native frame rate
//   '-f', 'dshow',
//   '-i', 'video=HP TrueVision HD Camera', // Input file
//   '-f', 'dshow',
//   '-i', 'audio=Microphone Array (Intel® Smart Sound Technology for Digital Microphones)',
//   '-c:v', 'libx264', // Video codec
//   '-preset', 'veryfast', // Preset for encoding speed
//   '-b:v', '3000k', // Bitrate
//   '-maxrate', '3000k',
//   '-bufsize', '6000k',
//   '-pix_fmt', 'yuv420p',
//   '-c:a', 'aac', // Audio codec
//   '-b:a', '128k', // Audio bitrate
//   '-ar', '44100', // Audio sample rate
//   '-f', 'flv', // Output format for RTMP
//   `${streamUrl}/${streamKey}`, // Full RTMP URL
// ]);

// // Output FFmpeg logs
// ffmpeg.stdout.on('data', data => console.log(`stdout: ${data}`));
// ffmpeg.stderr.on('data', data => console.error(`stderr: ${data}`));
// ffmpeg.on('close', code => console.log(`FFmpeg process exited with code ${code}`));

