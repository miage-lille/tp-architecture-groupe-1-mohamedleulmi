import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(user => user.props.id === id);
    return user ? user : null;
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.props.id === user.props.id);
    if (index === -1) {
      this.users.push(user);
    } else {
      this.users[index] = user;
    }
  }
}