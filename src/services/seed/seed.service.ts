import { Injectable } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { usersSeed } from './data/user.seed';

@Injectable()
export class SeedService {
  constructor(private readonly userService: UserService) {}

  private async seedUsers(): Promise<void> {
    for (const userData of usersSeed) {
      await this.userService.create(userData);
    }
  }

  private async customSeed(
    service: { create: (arg0: any) => any },
    seedData: any,
  ): Promise<void> {
    for (const data of seedData) {
      await service.create(data);
    }
  }

  async seedAll(): Promise<void> {
    await this.seedUsers();
    console.log('🚀 ~ SeedService ~ seedAll ~ ✅:');
  }
}
