import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { BookSeat } from 'src/webinars/use-cases/book-seat';
import { User } from 'src/users/entities/user.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { ParticipantAlreadyRegisteredException } from '../exceptions/participation-already-registred';
import { NoSeatsAvailableException } from '../exceptions/no-seat-available';
import { InMemoryUserRepository } from '../adapters/user-repository.in-memory';

describe('Feature: Book a seat', () => {
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: InMemoryMailer;
  let useCase: BookSeat;

  const user = new User({ id: 'user-alice-id', email: 'alice@example.com', password: 'password' });
  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: 'organizer-id',
    title: 'Webinar title',
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
    seats: 100,
  });

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    userRepository = new InMemoryUserRepository([user]);
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = new InMemoryMailer();
    useCase = new BookSeat(participationRepository, userRepository, webinarRepository, mailer);
  });

  it('should book a seat for a user', async () => {
    await useCase.execute({ webinarId: 'webinar-1', user });

    const participations = await participationRepository.findByWebinarId('webinar-1');
    expect(participations).toHaveLength(1);
    expect(participations[0].props.userId).toBe('user-alice-id');
  });

  it('should throw an error if the user is already registered', async () => {
    await useCase.execute({ webinarId: 'webinar-1', user });

    await expect(useCase.execute({ webinarId: 'webinar-1', user })).rejects.toThrow(
      ParticipantAlreadyRegisteredException,
    );
  });

  it('should throw an error if no seats are available', async () => {
    webinar.props.seats = 1;
    await useCase.execute({ webinarId: 'webinar-1', user });

    const anotherUser = new User({ id: 'user-bob-id', email: 'bob@example.com', password: 'password' });
    await expect(useCase.execute({ webinarId: 'webinar-1', user: anotherUser })).rejects.toThrow(
      NoSeatsAvailableException,
    );
  });

  it('should send an email to the organizer', async () => {
    await useCase.execute({ webinarId: 'webinar-1', user });

    expect(mailer.sentEmails).toHaveLength(1);
    expect(mailer.sentEmails[0].to).toBe('organizer-id');
    expect(mailer.sentEmails[0].subject).toBe('New participant registered');
    expect(mailer.sentEmails[0].body).toContain('alice@example.com');
  });
});