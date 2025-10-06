// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    entityId: string;
    entityPath: string;
  };
}

export interface RegisterData {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || 'An error occurred',
          statusCode: response.status,
          error: data.error,
        };
        throw error;
      }

      return data;
    } catch (error: any) {
      if (error.statusCode === 401 && this.refreshToken && !endpoint.includes('/auth/refresh')) {
        // Try to refresh token
        try {
          const refreshResponse = await this.refreshAccessToken();
          this.setTokens(refreshResponse.access_token, this.refreshToken);
          
          // Retry the original request
          const retryHeaders: Record<string, string> = {
            ...headers,
            'Authorization': `Bearer ${refreshResponse.access_token}`,
          };
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
          
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw retryData;
          }
          return retryData;
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw error
          this.clearTokens();
          throw error;
        }
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async forgotPassword(data: { email: string }): Promise<{ message: string; resetToken?: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { token: string; newPassword: string }): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshAccessToken(): Promise<{ access_token: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // Generic POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic PATCH request
  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Entity Management APIs
  async getEntities(filters?: {
    type?: 'entity' | 'company' | 'department';
    parentId?: string;
    level?: number;
    search?: string;
    ancestorId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.parentId) params.append('parentId', filters.parentId);
    if (filters?.level !== undefined) params.append('level', filters.level.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ancestorId) params.append('ancestorId', filters.ancestorId);
    
    const queryString = params.toString();
    console.log('queryString', queryString);
    
    return this.get(`/entities${queryString ? `?${queryString}` : ''}`);
  }

  async getEntityHierarchy(maxDepth?: number): Promise<any> {
    const params = maxDepth ? `?maxDepth=${maxDepth}` : '';
    return this.get(`/entities/hierarchy${params}`);
  }

  async getEntity(id: string): Promise<any> {
    return this.get(`/entities/${id}`);
  }

  async createEntity(data: {
    name: string;
    type: 'entity' | 'company' | 'department';
    parentId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return this.post('/entities', data);
  }

  async updateEntity(id: string, data: {
    name?: string;
    type?: 'entity' | 'company' | 'department';
    metadata?: Record<string, any>;
  }): Promise<any> {
    return this.patch(`/entities/${id}`, data);
  }

  async moveEntity(id: string, newParentId?: string): Promise<any> {
    return this.patch(`/entities/${id}/move`, { newParentId });
  }

  async deleteEntity(id: string): Promise<any> {
    return this.delete(`/entities/${id}`);
  }

  async getEntityStats(): Promise<any> {
    return this.get('/entities/stats');
  }

  // User Management APIs
  async getUsers(filters?: {
    registrationStatus?: string;
    role?: string;
    entityId?: string;
    whatsappConnectionStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: any[], total: number, page: number, limit: number, totalPages: number }> {
    const params = new URLSearchParams();
    if (filters?.registrationStatus) params.append('registrationStatus', filters.registrationStatus);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.whatsappConnectionStatus) params.append('whatsappConnectionStatus', filters.whatsappConnectionStatus);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.get(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string): Promise<any> {
    return this.get(`/users/${id}`);
  }

  async createUser(data: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    entityId: string;
    tenantId: string;
    role?: string;
  }): Promise<any> {
    return this.post('/users', data);
  }

  async inviteUser(data: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    entityId: string;
    tenantId: string;
    role?: string;
  }): Promise<any> {
    return this.post('/users/invite', data);
  }

  async bulkInviteUsers(data: {
    users: Array<{
      phoneNumber: string;
      email: string;
      firstName: string;
      lastName: string;
      entityId: string;
      role?: string;
    }>;
    tenantId: string;
  }): Promise<any> {
    return this.post('/users/bulk-invite', data);
  }

  async updateUser(id: string, data: {
    phoneNumber?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    entityId?: string;
    role?: string;
    password?: string;
  }): Promise<any> {
    return this.patch(`/users/${id}`, data);
  }

  async updateUserRegistrationStatus(id: string, status: string): Promise<any> {
    return this.patch(`/users/${id}/registration-status`, { status });
  }

  async updateUserWhatsAppStatus(id: string, status: string): Promise<any> {
    return this.patch(`/users/${id}/whatsapp-status`, { status });
  }

  async deleteUser(id: string): Promise<any> {
    return this.delete(`/users/${id}`);
  }

  async getUserStats(): Promise<any> {
    return this.get('/users/stats');
  }

  async searchUsers(query: string): Promise<any[]> {
    return this.get(`/users/search?q=${encodeURIComponent(query)}`);
  }
}

// Export a singleton instance
export const api = new ApiClient(API_BASE_URL);

