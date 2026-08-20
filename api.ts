/**
 * API Service Client for ResqNet Django Backend (http://localhost:8000/api/)
 * 
 * Provides asynchronous functions to fetch and mutate:
 * - Incidents (Emergency reports & status updates)
 * - Resources (Community supply inventories)
 * - Users & Volunteer Profiles
 * - Emergency 5km Alerts
 * - Chat Messages & Evaluations
 */

import { Incident, Resource, Alert, ChatMessage, User, VolunteerEvaluation } from './types';

// Base URL pointing to the Django REST Framework API
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Generic HTTP Request Helper with Error Handling
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      console.warn(`API Error [${response.status}] on ${endpoint}`);
      return null;
    }

    // Handle 204 No Content
    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error) {
    console.error(`Network Error reaching Django API on ${endpoint}:`, error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 1. INCIDENTS API
// -----------------------------------------------------------------------------

/**
 * Fetch all incidents from Django database
 */
export async function getIncidentsAPI(): Promise<Incident[]> {
  const data = await fetchAPI<any[]>('/incidents/');
  if (!data) return [];
  
  return data.map(item => ({
    id: item.id || item.incident_id,
    type: item.type || item.incident_type,
    severity: item.severity,
    description: item.description,
    latitude: item.latitude,
    longitude: item.longitude,
    status: item.status,
    reportedBy: item.reportedBy || 'u1',
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    responseTime: item.responseTime
  }));
}

/**
 * Create a new emergency incident report in Django DB
 */
export async function createIncidentAPI(incident: Incident): Promise<Incident | null> {
  const payload = {
    incident_id: incident.id,
    incident_type: incident.type,
    severity: incident.severity,
    description: incident.description,
    latitude: incident.latitude,
    longitude: incident.longitude,
    status: incident.status,
    reportedById: incident.reportedBy,
  };

  const response = await fetchAPI<any>('/incidents/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response) return null;

  return {
    ...incident,
    id: response.id || incident.id
  };
}

/**
 * Update incident status (PENDING -> IN_PROGRESS -> RESOLVED)
 */
export async function updateIncidentStatusAPI(id: string, status: string): Promise<boolean> {
  const response = await fetchAPI<any>(`/incidents/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response !== null;
}

// -----------------------------------------------------------------------------
// 2. RESOURCES API
// -----------------------------------------------------------------------------

/**
 * Fetch all community inventory resources from Django DB
 */
export async function getResourcesAPI(): Promise<Resource[]> {
  const data = await fetchAPI<any[]>('/resources/');
  if (!data) return [];

  return data.map(item => ({
    id: item.id || item.resource_id,
    type: item.type || item.resource_type,
    quantity: item.quantity,
    latitude: item.latitude,
    longitude: item.longitude,
    updatedBy: item.updatedBy || 'v1',
    status: item.status,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  }));
}

/**
 * Register a new community resource supply in Django DB
 */
export async function createResourceAPI(resource: Resource): Promise<Resource | null> {
  const payload = {
    resource_id: resource.id,
    resource_type: resource.type,
    quantity: resource.quantity,
    latitude: resource.latitude,
    longitude: resource.longitude,
    updatedById: resource.updatedBy,
    status: resource.status,
  };

  const response = await fetchAPI<any>('/resources/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response) return null;
  return resource;
}

/**
 * Update inventory availability status (available, low, unavailable)
 */
export async function updateResourceStatusAPI(id: string, status: string): Promise<boolean> {
  const response = await fetchAPI<any>(`/resources/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response !== null;
}

// -----------------------------------------------------------------------------
// 3. MESSAGES API
// -----------------------------------------------------------------------------

/**
 * Fetch chat messages from Django DB
 */
export async function getMessagesAPI(): Promise<ChatMessage[]> {
  const data = await fetchAPI<any[]>('/messages/');
  if (!data) return [];

  return data.map(item => ({
    id: item.id || item.message_id,
    userId: item.userId || 'u1',
    userName: item.userName,
    role: item.role,
    text: item.text,
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    language: item.language,
    channelId: item.channelId || 'general',
  }));
}

/**
 * Post a new chat message to Django DB
 */
export async function createMessageAPI(message: ChatMessage): Promise<ChatMessage | null> {
  const payload = {
    message_id: message.id,
    userIdInput: message.userId,
    userName: message.userName,
    role: message.role,
    text: message.text,
    language: message.language,
    channelId: message.channelId,
  };

  const response = await fetchAPI<any>('/messages/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response) return null;
  return message;
}

// -----------------------------------------------------------------------------
// 4. USERS & VOLUNTEERS API
// -----------------------------------------------------------------------------

/**
 * Fetch all registered users / volunteers from Django DB
 */
export async function getUsersAPI(): Promise<User[]> {
  const data = await fetchAPI<any[]>('/users/');
  if (!data) return [];

  return data.map(item => ({
    id: item.id || item.user_id,
    name: item.name,
    role: item.role,
    location: item.location || { lat: item.latitude || 34.0522, lng: item.longitude || -118.2437 },
    rating: item.rating,
    totalWorks: item.totalWorks || item.total_works,
    preferredLanguage: item.preferredLanguage,
    volunteerType: item.volunteerType,
    organization: item.organization,
    bio: item.bio,
  }));
}

// -----------------------------------------------------------------------------
// 5. EVALUATIONS API
// -----------------------------------------------------------------------------

/**
 * Create a new volunteer performance evaluation in Django DB
 */
export async function createEvaluationAPI(evalData: VolunteerEvaluation): Promise<VolunteerEvaluation | null> {
  const payload = {
    evaluation_id: evalData.id,
    volunteerId: evalData.volunteerId,
    authorityId: evalData.authorityId,
    rating: evalData.rating,
    comment: evalData.comment,
    linkedWorkId: evalData.linkedWorkId,
  };

  const response = await fetchAPI<any>('/evaluations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response) return null;
  return evalData;
}
