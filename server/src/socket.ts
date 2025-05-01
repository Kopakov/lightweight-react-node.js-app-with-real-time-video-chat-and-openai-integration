import { Server, Socket } from 'socket.io';
import { AppDataSource } from './database';
import { ChatSession } from './entities/ChatSession';
import { Message } from './entities/Message';

// Mock AI responses
const mockResponses = [
  "I understand your concern. Let me help you with that.",
  "That's a good question! Here's what I can tell you...",
  "I'm here to assist you. Could you provide more details?",
  "Based on your query, I would recommend...",
  "Let me check that for you.",
  "I'm processing your request. Please hold on.",
  "I can help you with that. Here's what you need to know...",
  "That's an interesting point. Let me think about it...",
  "I'm analyzing your situation. One moment please.",
  "I have some suggestions that might help you."
];

const getMockAIResponse = (userMessage: string): string => {
  // Simple keyword-based response selection
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How can I assist you today?";
  }
  if (lowerMessage.includes('help')) {
    return "I'm here to help! What specific assistance do you need?";
  }
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return "Goodbye! Have a great day!";
  }
  
  // Return a random response if no keywords match
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

interface UserSocket extends Socket {
  userId?: number;
  sessionId?: number;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: UserSocket) => {
    console.log('Client connected');

    socket.on('join-session', async (sessionId: number) => {
      socket.sessionId = sessionId;
      socket.join(`session-${sessionId}`);
    });

    socket.on('leave-session', (sessionId: number) => {
      socket.leave(`session-${sessionId}`);
      socket.sessionId = undefined;
    });

    socket.on('message', async (data: { content: string; sessionId: number }) => {
      const { content, sessionId } = data;
      
      // Save message to database
      const messageRepo = AppDataSource.getRepository(Message);
      const sessionRepo = AppDataSource.getRepository(ChatSession);
      
      const session = await sessionRepo.findOne({ where: { id: sessionId } });
      if (!session) return;

      const message = messageRepo.create({
        content,
        senderType: 'user',
        senderId: socket.userId,
        session
      });
      await messageRepo.save(message);

      // Broadcast message to all users in the session
      io.to(`session-${sessionId}`).emit('message', {
        content,
        senderType: 'user',
        senderId: socket.userId,
        createdAt: message.createdAt
      });

      // Get mock AI response
      const aiResponse = getMockAIResponse(content);
      
      // Save AI response to database
      const aiMessage = messageRepo.create({
        content: aiResponse,
        senderType: 'ai',
        session
      });
      await messageRepo.save(aiMessage);

      // Broadcast AI response
      io.to(`session-${sessionId}`).emit('message', {
        content: aiResponse,
        senderType: 'ai',
        createdAt: aiMessage.createdAt
      });
    });

    socket.on('video-offer', (data: { offer: any; sessionId: number }) => {
      socket.to(`session-${data.sessionId}`).emit('video-offer', data.offer);
    });

    socket.on('video-answer', (data: { answer: any; sessionId: number }) => {
      socket.to(`session-${data.sessionId}`).emit('video-answer', data.answer);
    });

    socket.on('ice-candidate', (data: { candidate: any; sessionId: number }) => {
      socket.to(`session-${data.sessionId}`).emit('ice-candidate', data.candidate);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}; 