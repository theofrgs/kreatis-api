import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async hash(toHash: string): Promise<string> {
    return toHash == null
      ? null
      : await bcrypt.hash(toHash, await bcrypt.genSalt());
  }

  async equals(str: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(str, hash);
  }
}
