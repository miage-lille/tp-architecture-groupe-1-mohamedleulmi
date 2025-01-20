import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Participation } from '../entities/participation.entity';

export class InMemoryParticipationRepository implements IParticipationRepository {
  private participations: Participation[] = [];

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.participations.filter(p => p.props.webinarId === webinarId);
  }
  
  async findByWebinarIdAndUserId(webinarId: string, userId: string): Promise<Participation | null> {
    const participation = this.participations.find(p => p.props.webinarId === webinarId && p.props.userId === userId);
    return participation ? participation : null;
  }

  async save(participation: Participation): Promise<void> {
    this.participations.push(participation);
  }
}