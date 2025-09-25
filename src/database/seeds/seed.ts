/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AppSeeder } from './app.seeder';
import { SeedsModule } from './seeds.module';
import { NestFactory } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/require-await
async function bootstrap(): Promise<void> {
  NestFactory.createApplicationContext(SeedsModule).then((appContext: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .finally(() => appContext.close());
  });
}
bootstrap();
