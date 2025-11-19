import UserSeeder from './user.seeder';
import TaskSeeder from './task.seeder';
import { AppDataSource } from '../data-source';

export default class MainSeeder {
  public static async run(): Promise<void> {
    try {
      // Initialize data source
      await AppDataSource.initialize();
      console.log('Data source initialized');

      // Run user seeder first
      const userSeeder = new UserSeeder();
      await userSeeder.run(AppDataSource);

      // Run task seeder after users
      const taskSeeder = new TaskSeeder();
      await taskSeeder.run(AppDataSource);

      console.log('All seeds completed successfully');
    } catch (error) {
      console.error('Error during seeding:', error);
    } finally {
      await AppDataSource.destroy();
    }
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  MainSeeder.run();
}
