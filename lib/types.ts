export type Gender = 'F' | 'M' | 'O';

export type HomeArea = {
  id?: string;
  label: string;
  lat: number;
  lng: number;
  radius_m: number;
};

export type InterestTag = {
  id: string;
  label: string;
  emoji: string;
  count?: number;
};

export type OnboardingDraft = {
  intentId: string | null;
  selectedTags: string[];
  name: string;
  age: string;
  gender: Gender | null;
};

export type Profile = {
  id: string;
  first_name: string;
  gender: Gender;
  birth_year: number;
  home_area?: HomeArea | null;
  radius_km?: number;
  tags: string[];
  onboarding_completed: boolean;
};

export type Post = {
  id: string;
  author_id: string;
  title: string;
  text: string;
  tags: string[];
  category: 'life' | 'mind' | 'hobby';
  location_label?: string;
  latitude?: number;
  longitude?: number;
  radius_m?: number;
  created_at: string;
};

export type Conversation = {
  id: string;
  post_id: string;
  participant_ids: string[];
  last_message_at?: string;
  created_at: string;
};
