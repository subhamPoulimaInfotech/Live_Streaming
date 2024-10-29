const express = require('express');
const app = express();

// Body parser middleware to parse request body
app.use(express.json());

const RTMP_SERVER_URL = 'rtmp://192.168.0.100:1935/live'; // Replace with your RTMP server URL

// API endpoint to start streaming
app.post('/start-stream', (req, res) => {
    const { streamerId } = req.body;

    if (!streamerId) {
        return res.status(400).json({ message: 'streamerId is required' });
    }

    // Generate a stream key (you can customize this)
    const streamKey = `${streamerId}-${Date.now()}`;

    // Respond with the RTMP URL and Stream Key
    return res.json({
        message: 'Stream started',
        rtmpUrl: `${RTMP_SERVER_URL}/${streamKey}`,
        streamKey: streamKey
    });
});

app.listen(5001, () => {
    console.log('Server is running on http://192.168.0.100:5001');
});
