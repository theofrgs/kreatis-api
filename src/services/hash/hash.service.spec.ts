import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    hashService = module.get<HashService>(HashService);
  });

  it('should hash and compare correctly', async () => {
    // Test hashing
    const plainTextPassword = 'password123';
    const hashedPassword = await hashService.hash(plainTextPassword);

    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');

    // Test comparison
    const isMatch = await hashService.equals(plainTextPassword, hashedPassword);
    expect(isMatch).toBeTruthy();

    const wrongPassword = 'wrongPassword';
    const isWrongMatch = await hashService.equals(
      wrongPassword,
      hashedPassword,
    );
    expect(isWrongMatch).toBeFalsy();
  });

  it('should return null when trying to hash null', async () => {
    const hashedNull = await hashService.hash(null);
    expect(hashedNull).toBeNull();
  });
});
