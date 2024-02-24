import { BaseEntity } from '@src/services/extra-entity/base-entity.entity';
import { Credential } from '@src/credential/entities/credential.entity';
import { Entity, Column, OneToOne } from 'typeorm';

@Entity('native-credentials')
export class NativeCredential extends BaseEntity {
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToOne(() => Credential, (credential) => credential.native, {
    cascade: true,
  })
  credential: Credential;
}
