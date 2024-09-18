import { Role } from 'src/constants';

export class UserDto {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role | null;
}
