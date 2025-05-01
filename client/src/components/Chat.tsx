import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  content: string;
  senderType: 'user' | 'agent' | 'ai';
  senderId?: number;
  createdAt: Date;
}

interface ChatProps {
  sessionId: number;
  userId: number;
}

const Chat = ({ sessionId, userId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

    // Load previous messages
    fetch(`http://localhost:3000/api/sessions/${sessionId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // Listen for new messages
    socketRef.current.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    socketRef.current?.emit('message', {
      content: newMessage,
      sessionId,
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-950 text-white border border-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow ${message.senderType === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.senderType === 'ai'
                    ? 'bg-green-600 text-white rounded-bl-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
            >
              <div className="text-xs font-bold uppercase tracking-wide mb-1 opacity-75">
                {message.senderType === 'user'
                  ? 'You'
                  : message.senderType === 'ai'
                    ? 'AI Assistant'
                    : 'Agent'}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className="text-[10px] mt-1 text-gray-300 text-right">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-gray-800 bg-gray-900 px-4 py-3"
      >
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 