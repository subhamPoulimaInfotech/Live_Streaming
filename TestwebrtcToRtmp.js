const wrtc = require('wrtc');
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PassThrough } = require('stream');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const streamUrl = 'rtmp://localhost:1935/live';
const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942';
const RTMP_URL = `${streamUrl}/${streamKey}`;

app.post('/start-stream', async (req, res) => {
    console.log('Received request to start streaming...');
    
    try {
        const { sdp } = req.body;

        if (!sdp) {
            console.error('SDP is missing in the request body');
            return res.status(400).json({ error: 'SDP is required' });
        }

        console.log('Received SDP:', sdp);  // Log SDP to confirm input

        const peerConnection = new wrtc.RTCPeerConnection();
        let videoStream = new PassThrough();

        let ffmpegStarted = false;

        // Only initialize FFmpeg once for the first track
        peerConnection.ontrack = (event) => {
            if (ffmpegStarted) return;  // Prevent handling multiple tracks
            console.log('Incoming stream detected, setting up FFmpeg...');

            const stream = event.streams[0];
            if (!stream) {
                console.error('No media stream available.');
                return;
            }

            // Log each track type for debugging
            stream.getTracks().forEach((track) => {
                console.log(`Track type: ${track.kind}`);
            });

            ffmpegStarted = true;  // Ensure FFmpeg is only started once

            ffmpeg()
                .input(videoStream)
                .inputFormat('sdp')
                .outputOptions([
                    '-c:v libx264',
                    '-preset veryfast',
                    '-b:v 3000k',
                    '-maxrate 3000k',
                    '-bufsize 6000k',
                    '-pix_fmt yuv420p',
                    '-c:a aac',
                    '-ar 44100',
                    '-b:a 128k',
                    '-f flv',
                ])
                .output(RTMP_URL)
                .on('start', () => console.log('FFmpeg process started for RTMP streaming'))
                .on('error', (err) => console.error('FFmpeg error:', err))
                .on('end', () => console.log('FFmpeg process ended'))
                .run();
        };

        await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription({
            type: 'offer',
            sdp: sdp
        }));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('SDP answer created and sent back to client.');
        res.json({ sdp: answer.sdp });
    } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ error: 'Could not start stream' });
    }
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
