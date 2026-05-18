export interface ActiveTimer {
  id: number;
  project: string;
  projectColor: string;
  activity: string;
  description: string;
  beginSeconds: number;
}

export interface RecentTask {
  id: number;
  project: string;
  projectColor: string;
  activity: string;
  description: string;
  lastUsed: string;
}
