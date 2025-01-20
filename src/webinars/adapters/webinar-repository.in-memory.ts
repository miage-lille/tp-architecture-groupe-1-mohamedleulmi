import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}
  findById(id: string): Promise<Webinar> {
    const webinar = this.database.find((webinar) => webinar.props.id === id);
    if (webinar) {
      return Promise.resolve(webinar);
    } else {
      return Promise.reject(new Error('Webinar not found'));
    }
  }
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
}
