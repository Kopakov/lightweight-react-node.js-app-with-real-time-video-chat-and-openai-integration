import { Express } from 'express';
import { AppDataSource } from './database';
import { User } from './entities/User';
import { ChatSession } from './entities/ChatSession';
import { Message } from './entities/Message';

export const setupRoutes = (app: Express) => {
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = userRepo.create(req.body);
      await userRepo.save(user);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: parseInt(req.params.id) } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  });

  // Chat session routes
  app.post('/api/sessions', async (req, res) => {
    try {
      const sessionRepo = AppDataSource.getRepository(ChatSession);
      const session = sessionRepo.create({
        ...req.body,
        status: 'waiting'
      });
      await sessionRepo.save(session);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Error creating session' });
    }
  });

  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const sessionRepo = AppDataSource.getRepository(ChatSession);
      const session = await sessionRepo.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['messages']
      });
      if (!session) return res.status(404).json({ error: 'Session not found' });
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching session' });
    }
  });

  app.get('/api/sessions', async (req, res) => {
    try {
      const sessionRepo = AppDataSource.getRepository(ChatSession);
      const sessions = await sessionRepo.find({
        relations: ['messages']
      });
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching sessions' });
    }
  });

  // Message routes
  app.get('/api/sessions/:sessionId/messages', async (req, res) => {
    try {
      const messageRepo = AppDataSource.getRepository(Message);
      const messages = await messageRepo.find({
        where: { session: { id: parseInt(req.params.sessionId) } },
        order: { createdAt: 'ASC' }
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  });
}; 