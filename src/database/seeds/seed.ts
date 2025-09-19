import { AppSeeder } from './app.seeder';
import { SeedsModule } from './seeds.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap(): Promise<void> {
  NestFactory.createApplicationContext(SeedsModule).then((appContext: any) => {
    const appSeeder = appContext.get(AppSeeder);
    console.log('Seed started');
    appSeeder
      .seed()
      .then(() => {
        console.log('Seeding Completed');
      })
      .catch((error: any) => {
        console.log('Seeding failed!');
        throw error;
      })
      .finally(() => appContext.close());
  });
}
bootstrap();
