import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  password: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'player' })
  role: string;

  @Column({ nullable: true })
  refreshToken: string;

  @BeforeInsert()
  async hashPassword() {
    console.log('eh');
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async updatePassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async isMatch(enteredPassword: string): Promise<boolean> {
    if (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
  }
}
