import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'rossbrewster'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_NAME', 'writ99'),
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
    migrationsRun: configService.get('DB_MIGRATIONS_RUN', true),
    synchronize: configService.get('DB_SYNCHRONIZE', false),
    logging: configService.get('DB_LOGGING', false),
    ssl: isProduction ? {
      rejectUnauthorized: false
    } : false
  };
};

const configService = new ConfigService();
export default new DataSource(createDatabaseConfig(configService) as any);