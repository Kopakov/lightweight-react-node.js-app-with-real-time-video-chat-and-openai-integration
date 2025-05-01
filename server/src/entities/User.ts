import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatSession } from './ChatSession';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: 'agent' | 'user';

  @OneToMany(() => ChatSession, session => session.user)
  sessions: ChatSession[];
} 