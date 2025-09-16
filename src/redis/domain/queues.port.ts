import { QueueName } from 'src/shared/enums/queue-names.enum';

export abstract class QueuesPort {
  abstract addJob(queueName: QueueName, jobData: any): Promise<void>;
}
