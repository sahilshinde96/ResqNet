
export enum UserRole {
  CITIZEN = 'citizen',
  VOLUNTEER = 'volunteer',
  AUTHORITY = 'authority'
}

export enum VolunteerType {
  LOCAL = 'Local Resident',
  NGO = 'NGO Member',
  SOCIAL_WORKER = 'Social Worker',
  GOVT = 'Govt. Official'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  SOS = 'sos'
}

export enum IncidentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved'
}

export enum Language {
  EN = 'English',
  ES = 'Spanish',
  HI = 'Hindi',
  FR = 'French',
  ZH = 'Chinese'
}

export interface Incident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  reportedBy: string;
  createdAt: Date;
  responseTime?: number; // minutes
}

export enum ResourceType {
  FOOD = 'food',
  WATER = 'water',
  MEDICAL = 'medical',
  SHELTER = 'shelter'
}

export interface Resource {
  id: string;
  type: ResourceType;
  quantity: number;
  latitude: number;
  longitude: number;
  updatedBy: string;
  status: 'available' | 'low' | 'unavailable';
  updatedAt: Date;
}

export interface Alert {
  id: string;
  incidentId: string;
  type: string;
  message: string;
  radiusKm: number;
  createdAt: Date;
}

export interface VolunteerEvaluation {
  id: string;
  volunteerId: string;
  authorityId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  linkedWorkId?: string; // Incident or Resource ID
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  text: string;
  timestamp: Date;
  language: Language;
  channelId: string; // 'general' or incident.id
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  totalWorks?: number;
  preferredLanguage?: Language;
  volunteerType?: VolunteerType;
  organization?: string;
  bio?: string;
}
