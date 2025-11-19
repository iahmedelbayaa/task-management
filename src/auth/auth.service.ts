import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from '../users/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersService.create(registerDto);
    return this.login(user);
  }

  login(user: User): { access_token: string; user: Partial<User> } {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }
}
