import { BaseEntity } from '@src/services/extra-entity/base-entity.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Credential } from '@src/credential/entities/credential.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @OneToOne(() => Credential, (credential) => credential.user)
  @JoinColumn()
  credential: Credential;
}
