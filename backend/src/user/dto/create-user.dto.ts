import { Role } from 'src/constants';

export class CreateUserDto {
  username: string;
  password: string;
  role: Role;
}