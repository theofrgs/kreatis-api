import { NativeCredential } from '@src/native-credential/entities/native-credential.entity';
import { BaseEntity } from '@src/services/extra-entity/base-entity.entity';
import { User } from '@src/user/entities/user.entity';
import { Entity, OneToOne, JoinColumn } from 'typeorm';

@Entity('credentials')
export class Credential extends BaseEntity {
  @OneToOne(() => User, (user) => user.credential, { cascade: true })
  user: User;

  @OneToOne(
    () => NativeCredential,
    (nativeCredential) => nativeCredential.credential,
  )
  @JoinColumn()
  native: NativeCredential;

  // @OneToOne(() => GoogleAuth, (googleAuth) => googleAuth.credential)
  // @JoinColumn()
  // googleAuth: GoogleAuth;

  // @OneToOne(() => FacebookAuth, (facebookAuth) => facebookAuth.credential)
  // @JoinColumn()
  // facebookAuth: FacebookAuth;
}
