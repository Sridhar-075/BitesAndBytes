export interface CurrentUser {
  id: string;
  email: string;
  role: 'PATIENT' | 'PROVIDER' | 'ORGANISATION_ADMIN' | 'PLATFORM_ADMIN';
  displayName: string;
}

export class ApiClient {
  private static activeUserId: string = 'usr-patient-1';

  static setActiveUser(userId: string) {
    this.activeUserId = userId;
  }

  static getActiveUserId(): string {
    return this.activeUserId;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-id', this.activeUserId);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      const err = new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = errorData;
      throw err;
    }

    return response.json();
  }

  // Auth & Profile
  static async getMe() {
    return this.request<{
      user: any;
      patientProfile: any;
      providerProfile: any;
      organisation: any;
      availableAccounts: Array<{ id: string; email: string; displayName: string; role: string }>;
    }>('/auth/me');
  }

  static async login(userId: string) {
    this.setActiveUser(userId);
    return this.request<{ success: boolean; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Patient Dashboard
  static async getPatientDashboard() {
    return this.request<{
      metrics: {
        totalRecords: number;
        platformUploadsCount: number;
        externalReferencesCount: number;
        connectedSources: number;
        pendingRequests: number;
        activeShares: number;
        activePlatformGrants: number;
        confirmedExternalShares: number;
      };
      patient: any;
      recentDocs: any[];
      recentActivities: any[];
    }>('/patient/dashboard');
  }

  // Documents
  static async getDocuments(params: {
    sourceType?: string;
    documentType?: string;
    searchQuery?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.sourceType && params.sourceType !== 'ALL') query.append('sourceType', params.sourceType);
    if (params.documentType && params.documentType !== 'ALL') query.append('documentType', params.documentType);
    if (params.searchQuery) query.append('searchQuery', params.searchQuery);
    if (params.page) query.append('page', params.page.toString());
    if (params.pageSize) query.append('pageSize', params.pageSize.toString());

    return this.request<{
      items: any[];
      pagination: { page: number; pageSize: number; total: number; totalPages: number };
    }>(`/documents?${query.toString()}`);
  }

  static async getDocumentById(documentId: string) {
    return this.request<any>(`/documents/${documentId}`);
  }

  static async viewDocument(documentId: string) {
    return this.request<any>(`/documents/${documentId}/view`);
  }

  static async addExternalReference(data: {
    sourceType: string;
    documentType: string;
    title: string;
    issuerName: string;
    recordDate: string;
    sourceDocumentReference: string;
    sourceConnectionId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.request<any>('/documents/external-reference', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async uploadDocument(data: {
    title: string;
    documentType: string;
    issuerName: string;
    recordDate: string;
    simulatedContent?: any;
    metadata?: Record<string, any>;
  }) {
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteDocument(documentId: string) {
    return this.request<{ success: boolean }>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Source Connections
  static async getSourceConnections() {
    return this.request<any[]>('/source-connections');
  }

  static async startDigiLocker() {
    return this.request<{ authUrl: string; stateToken: string; notice: string }>('/source-connections/digilocker/start', {
      method: 'POST',
    });
  }

  static async completeDigiLocker(stateToken: string) {
    return this.request<{ connection: any; discoverableRecords: any[]; message: string }>(
      '/source-connections/digilocker/mock-complete',
      {
        method: 'POST',
        body: JSON.stringify({ stateToken }),
      }
    );
  }

  static async disconnectSource(connectionId: string) {
    return this.request<any>(`/source-connections/${connectionId}/disconnect`, {
      method: 'POST',
    });
  }

  // Access Requests & Decisions
  static async getAccessRequests() {
    return this.request<any[]>('/access-requests');
  }

  static async getAccessRequestById(requestId: string) {
    return this.request<any>(`/access-requests/${requestId}`);
  }

  static async createAccessRequest(data: {
    patientId: string;
    documentIds: string[];
    purpose: string;
    reason: string;
    requestedDurationDays?: number;
  }) {
    return this.request<any>('/access-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async decideAccessRequest(
    requestId: string,
    decisions: Array<{ documentId: string; decision: 'APPROVE' | 'DENY' }>
  ) {
    return this.request<any>(`/access-requests/${requestId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decisions }),
    });
  }

  // Permissions & Consent Grants
  static async getPermissions() {
    return this.request<any[]>('/permissions');
  }

  static async grantClinicalEncounterAccess(documentId: string, durationDays: number = 7) {
    return this.request<any>('/clinical/instant-access', {
      method: 'POST',
      body: JSON.stringify({ documentId, durationDays }),
    });
  }

  static async revokePermission(grantId: string) {
    return this.request<any>(`/permissions/${grantId}/revoke`, {
      method: 'POST',
    });
  }

  // External Sharing
  static async getExternalSharingWorkflows() {
    return this.request<any[]>('/external-sharing');
  }

  static async mockConfirmExternalSharing(workflowId: string) {
    return this.request<any>(`/external-sharing/${workflowId}/mock-confirm`, {
      method: 'POST',
    });
  }

  static async mockDenyExternalSharing(workflowId: string, reason?: string) {
    return this.request<any>(`/external-sharing/${workflowId}/mock-deny`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async revokeExternalSharing(workflowId: string) {
    return this.request<any>(`/external-sharing/${workflowId}/revoke`, {
      method: 'POST',
    });
  }

  static async mockConfirmRevocation(workflowId: string) {
    return this.request<any>(`/external-sharing/${workflowId}/mock-revocation-confirm`, {
      method: 'POST',
    });
  }

  // Audit Events
  static async getAuditEvents() {
    return this.request<any[]>('/audit-events');
  }

  // Security Tests
  static async runSecurityTests() {
    return this.request<{
      summary: { total: number; passed: number; failed: number };
      tests: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        passed: boolean;
        actualResult: string;
        expectedResult: string;
        details: string;
      }>;
    }>('/security-tests/run', {
      method: 'POST',
    });
  }

  // Admin & Demo Reset
  static async getAdminOverview() {
    return this.request<any>('/admin/overview');
  }

  static async resetDemo() {
    return this.request<{ success: boolean; message: string }>('/admin/reset-demo', {
      method: 'POST',
    });
  }
}
