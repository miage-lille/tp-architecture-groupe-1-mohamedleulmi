import { Email, IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { ParticipantAlreadyRegisteredException } from '../exceptions/participation-already-registred';
import { NoSeatsAvailableException } from '../exceptions/no-seat-available';
import { Webinar } from '../entities/webinar.entity';
import { Participation } from '../entities/participation.entity';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    const webinar:Webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }

    //Vérifier que l'on ne participe pas déjà à ce webinaire
    const participation: Participation = await this.participationRepository.findByWebinarIdAndUserId(webinarId, user.props.id);
    if (participation) {
      throw new ParticipantAlreadyRegisteredException();
    }
    
    //Vérifier le nombre de participants restants
    if (participations.length >= webinar.props.seats) {
      throw new NoSeatsAvailableException();
    }

    const participation = new Participation({ userId: user.props.id, webinarId });
    await this.participationRepository.save(participation);

    //Envoyer un email à l'organisateur pour mentionner qu'un nouveau participant s'est inscrit
    const email: Email = {
      to: webinar.props.organizerId,
      subject: 'New participant registered',
      body: `User ${user.props.email} has registered for the webinar ${webinar.props.title}`,
    };
    await this.mailer.send(email);
  }

}
