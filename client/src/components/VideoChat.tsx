import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoChatProps {
  sessionId: number;
}

const VideoChat = ({ sessionId }: VideoChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current?.emit('join-session', sessionId);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // WebRTC event handlers
    socketRef.current.on('video-offer', async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        await createPeerConnection();
      }
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      socketRef.current?.emit('video-answer', { answer, sessionId });
    });

    socketRef.current.on('video-answer', async (answer: RTCSessionDescriptionInit) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      peerConnectionRef.current?.close();
    };
  }, [sessionId]);

  const createPeerConnection = async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local stream
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current!.srcObject = localStream;
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          candidate: event.candidate,
          sessionId,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      remoteVideoRef.current!.srcObject = event.streams[0];
    };

    return peerConnection;
  };

  const startCall = async () => {
    try {
      const peerConnection = await createPeerConnection();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketRef.current?.emit('video-offer', { offer, sessionId });
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    localVideoRef.current!.srcObject = null;
    remoteVideoRef.current!.srcObject = null;
    setIsCallActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white px-4 py-6 rounded-2xl ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-800 border border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-3 py-1 rounded-full">
            You
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-800 border border-gray-700">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-3 py-1 rounded-full">
            Remote
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-6">
        {!isCallActive ? (
          <button
            onClick={startCall}
            disabled={!isConnected}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoChat; 