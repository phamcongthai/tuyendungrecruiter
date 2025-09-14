export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  _id: string;
  jobId: any;
  userId: {
    _id: string;
    fullName?: string;
    email?: string;
  } | string;
  status: ApplicationStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}


