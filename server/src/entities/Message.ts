import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ChatSession } from './ChatSession';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatSession, session => session.messages)
  session: ChatSession;

  @Column()
  content: string;

  @Column()
  senderType: 'user' | 'agent' | 'ai';

  @Column({ nullable: true })
  senderId: number;

  @CreateDateColumn()
  createdAt: Date;
} 