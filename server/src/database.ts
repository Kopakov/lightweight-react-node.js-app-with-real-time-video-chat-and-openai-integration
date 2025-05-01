import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { ChatSession } from './entities/ChatSession';
import { Message } from './entities/Message';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [User, ChatSession, Message],
  migrations: [],
  subscribers: [],
});

export const setupDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}; 