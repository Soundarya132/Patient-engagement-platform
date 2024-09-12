const doctorVideo = document.getElementById('doctor-video');
const patientVideo = document.getElementById('patient-video');
const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');

let localStream;
let remoteStream;
let peerConnection;
const signalingServerUrl = 'ws://localhost:8080'; // Your signaling server URL

// STUN/TURN servers for WebRTC
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here if necessary
    ]
};

function handleICECandidateEvent(event) {
    if (event.candidate) {
        // Send ICE candidate to signaling server
        signalingServer.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
}

function handleTrackEvent(event) {
    remoteStream = event.streams[0];
    doctorVideo.srcObject = remoteStream;
}

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(iceServers);
    peerConnection.onicecandidate = handleICECandidateEvent;
    peerConnection.ontrack = handleTrackEvent;

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.onnegotiationneeded = async () => {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signalingServer.send(JSON.stringify({ type: 'offer', offer: peerConnection.localDescription }));
        } catch (error) {
            console.error('Error during negotiation', error);
        }
    };
}

async function startCall() {
    try {
        // Get local stream
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        patientVideo.srcObject = localStream;

        setupPeerConnection();

        // Connect to signaling server
        signalingServer = new WebSocket(signalingServerUrl);
        signalingServer.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            if (data.type === 'offer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                signalingServer.send(JSON.stringify({ type: 'answer', answer: peerConnection.localDescription }));
            } else if (data.type === 'answer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.type === 'candidate') {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };
    } catch (error) {
        console.error('Error starting call', error);
    }
}

function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    doctorVideo.srcObject = null;
    patientVideo.srcObject = null;
    if (signalingServer) {
        signalingServer.close();
    }
}

startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);
