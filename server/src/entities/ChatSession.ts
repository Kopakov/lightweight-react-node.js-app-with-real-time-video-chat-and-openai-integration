import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sessions)
  user: User;

  @Column({ nullable: true })
  agentId: number;

  @Column()
  status: 'active' | 'completed' | 'waiting';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @OneToMany(() => Message, message => message.session)
  messages: Message[];
} 