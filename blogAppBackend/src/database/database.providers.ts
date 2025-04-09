import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'local',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb+srv://surajsah0539:sps123456@cluster0.wstxowj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
  },
];