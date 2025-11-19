import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export default class UserSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user seeding');
      return;
    }

    const saltRounds = 10;

    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', saltRounds),
        role: UserRole.ADMIN,
      },
      {
        email: 'user1@example.com',
        password: await bcrypt.hash('User123!', saltRounds),
        role: UserRole.USER,
      },
      {
        email: 'user2@example.com',
        password: await bcrypt.hash('User123!', saltRounds),
        role: UserRole.USER,
      },
      {
        email: 'user3@example.com',
        password: await bcrypt.hash('User123!', saltRounds),
        role: UserRole.USER,
      },
    ];

    const createdUsers = userRepository.create(users);
    await userRepository.save(createdUsers);

    console.log('Users seeded successfully');
  }
}
