/* eslint-disable no-console */
import { AppSeeder } from './app.seeder';
import { SeedsModule } from './seeds.module';
import { NestFactory } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, require-await
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
