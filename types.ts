
export interface FoodItem {
  id: string;
  name: string;
  cal: number;
  p: number;
  c: number;
  g: number;
  time: string;
}

export interface UserState {
  target: number;
  consumed: number;
  p: number;
  c: number;
  g: number;
  log: FoodItem[];
  userName: string;
  profileImg: string;
  water: number;
  history: number[];
}

export type ViewType = 'home' | 'stats' | 'profile';

export interface AIAnalysisResult {
  name: string;
  cal: number;
  p: number;
  c: number;
  g: number;
}
