export class ParticipantAlreadyRegisteredException extends Error {
    constructor() {
      super('Participant is already registered for this webinar');
      this.name = 'ParticipantAlreadyRegisteredException';
    }
  }