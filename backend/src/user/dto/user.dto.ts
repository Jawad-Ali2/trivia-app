import { Role } from 'src/constants';

export class UserDto {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role | null;
}
