import React from 'react';
import { ApiClient } from './services/api.js';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { PatientOverview } from './views/PatientOverview.js';
import { PatientCatalogue } from './views/PatientCatalogue.js';
import { PatientSources } from './views/PatientSources.js';
import { PatientRequests } from './views/PatientRequests.js';
import { PatientPermissions } from './views/PatientPermissions.js';
import { PatientTimeline } from './views/PatientTimeline.js';
import { PatientAudit } from './views/PatientAudit.js';
import { PatientProfile } from './views/PatientProfile.js';
import { ProviderDashboard } from './views/ProviderDashboard.js';
import { ProviderCreateRequest } from './views/ProviderCreateRequest.js';
import { ProviderApprovedDocs } from './views/ProviderApprovedDocs.js';
import { ProviderPatientRecords } from './views/ProviderPatientRecords.js';
import { AdminDashboard } from './views/AdminDashboard.js';
import { DocumentDetailModal } from './components/DocumentDetailModal.js';
import { AddRecordModal } from './components/AddRecordModal.js';
import { DigiLockerModal } from './components/DigiLockerModal.js';
import { ReviewConsentModal } from './components/ReviewConsentModal.js';
import { SecurityTestModal } from './components/SecurityTestModal.js';
import { ClinicalDocumentModal } from './components/ClinicalDocumentModal.js';
import { EhrViewerModal } from './components/EhrViewerModal.js';

export default function App() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [patientProfile, setPatientProfile] = React.useState<any>(null);
  const [providerProfile, setProviderProfile] = React.useState<any>(null);
  const [organisation, setOrganisation] = React.useState<any>(null);
  const [availableAccounts, setAvailableAccounts] = React.useState<any[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = React.useState<string>('overview');

  // Dashboard metrics
  const [dashboardData, setDashboardData] = React.useState<any>(null);

  // Modals state
  const [selectedDoc, setSelectedDoc] = React.useState<any | null>(null);
  const [showAddRecordModal, setShowAddRecordModal] = React.useState(false);
  const [showDigiLockerModal, setShowDigiLockerModal] = React.useState(false);
  const [reviewRequest, setReviewRequest] = React.useState<any | null>(null);
  const [showSecurityTests, setShowSecurityTests] = React.useState(false);
  const [ehrViewerDoc, setEhrViewerDoc] = React.useState<any | null>(null);
  const [clinicalViewerDocId, setClinicalViewerDocId] = React.useState<string | null>(null);

  // Load user & initial data
  const loadMe = async () => {
    try {
      const data = await ApiClient.getMe();
      setCurrentUser(data.user);
      setPatientProfile(data.patientProfile);
      setProviderProfile(data.providerProfile);
      setOrganisation(data.organisation);
      setAvailableAccounts(data.availableAccounts || []);

      if (data.user.role === 'PATIENT') {
        loadPatientDashboard();
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    }
  };

  const loadPatientDashboard = async () => {
    try {
      const d = await ApiClient.getPatientDashboard();
      setDashboardData(d);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  React.useEffect(() => {
    loadMe();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    try {
      await ApiClient.login(userId);
      const data = await ApiClient.getMe();
      setCurrentUser(data.user);
      setPatientProfile(data.patientProfile);
      setProviderProfile(data.providerProfile);
      setOrganisation(data.organisation);

      // Select default tab for persona
      if (data.user.role === 'PATIENT') {
        setActiveTab('overview');
        loadPatientDashboard();
      } else if (data.user.role === 'PROVIDER') {
        setActiveTab('provider-dashboard');
      } else {
        setActiveTab('admin-overview');
      }
    } catch (err: any) {
      console.error('Error switching user:', err);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset entire prototype database to clean initial seed data?')) {
      try {
        await ApiClient.resetDemo();
        await loadMe();
        alert('Continuum Health prototype reset to clean seed state.');
      } catch (err: any) {
        alert(err.message || 'Error resetting demo');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <Header
        currentUser={currentUser}
        availableAccounts={availableAccounts}
        onSwitchUser={handleSwitchUser}
        onOpenSecurityTests={() => setShowSecurityTests(true)}
        onResetDemo={handleResetDemo}
        pendingRequestsCount={dashboardData?.metrics?.pendingRequests || 0}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          userRole={currentUser?.role || 'PATIENT'}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingRequestsCount={dashboardData?.metrics?.pendingRequests || 0}
          userName={currentUser?.displayName}
          userEmail={currentUser?.email}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentUser?.role === 'PATIENT' ? (
            <>
              {activeTab === 'overview' && (
                <PatientOverview
                  dashboardData={dashboardData}
                  onOpenAddRecord={() => setShowAddRecordModal(true)}
                  onOpenConnectSource={() => setShowDigiLockerModal(true)}
                  onNavigateToTab={setActiveTab}
                  onSelectDoc={setSelectedDoc}
                  onOpenEhrViewer={(doc) => setEhrViewerDoc(doc)}
                />
              )}

              {activeTab === 'records' && (
                <PatientCatalogue
                  onOpenAddRecord={() => setShowAddRecordModal(true)}
                  onOpenConnectSource={() => setShowDigiLockerModal(true)}
                  onSelectDoc={setSelectedDoc}
                  onOpenEhrViewer={(doc) => setEhrViewerDoc(doc)}
                />
              )}

              {activeTab === 'sources' && (
                <PatientSources
                  onOpenDigiLockerModal={() => setShowDigiLockerModal(true)}
                  onOpenUploadModal={() => setShowAddRecordModal(true)}
                  onRefresh={loadPatientDashboard}
                />
              )}

              {activeTab === 'requests' && (
                <PatientRequests
                  onReviewRequest={(req) => setReviewRequest(req)}
                  onRefresh={loadPatientDashboard}
                />
              )}

              {activeTab === 'permissions' && (
                <PatientPermissions onRefresh={loadPatientDashboard} />
              )}

              {activeTab === 'timeline' && (
                <PatientTimeline
                  onSelectDoc={setSelectedDoc}
                  onOpenEhrViewer={(doc) => setEhrViewerDoc(doc)}
                />
              )}

              {activeTab === 'audit' && <PatientAudit />}

              {activeTab === 'profile' && (
                <PatientProfile patient={patientProfile} />
              )}
            </>
          ) : currentUser?.role === 'PROVIDER' ? (
            <>
              {activeTab === 'provider-dashboard' && (
                <ProviderDashboard
                  currentProvider={providerProfile}
                  organisation={organisation}
                  onNavigateToTab={setActiveTab}
                  onOpenCreateRequest={() => setActiveTab('provider-create-request')}
                />
              )}

              {activeTab === 'provider-records' && (
                <ProviderPatientRecords
                  currentProvider={providerProfile}
                  onAccessDocument={(id) => setClinicalViewerDocId(id)}
                  onOpenEhrViewer={(doc) => setEhrViewerDoc(doc)}
                  onRequestAccess={() => setActiveTab('provider-create-request')}
                />
              )}

              {activeTab === 'provider-requests' && (
                <ProviderDashboard
                  currentProvider={providerProfile}
                  organisation={organisation}
                  onNavigateToTab={setActiveTab}
                  onOpenCreateRequest={() => setActiveTab('provider-create-request')}
                />
              )}

              {activeTab === 'provider-create-request' && (
                <ProviderCreateRequest
                  onSuccess={() => setActiveTab('provider-dashboard')}
                  onCancel={() => setActiveTab('provider-dashboard')}
                />
              )}

              {activeTab === 'provider-approved' && (
                <ProviderApprovedDocs
                  onAccessDocument={(id) => setClinicalViewerDocId(id)}
                />
              )}

              {activeTab === 'provider-external' && (
                <PatientPermissions onRefresh={() => {}} />
              )}

              {activeTab === 'provider-audit' && <PatientAudit />}
            </>
          ) : (
            /* PLATFORM ADMIN */
            <>
              {activeTab === 'admin-overview' && <AdminDashboard />}
              {activeTab === 'admin-audit' && <PatientAudit />}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefresh={loadPatientDashboard}
          onOpenEhrViewer={(doc) => setEhrViewerDoc(doc)}
          onOpenClinicalViewer={(id) => setClinicalViewerDocId(id)}
        />
      )}

      {showAddRecordModal && (
        <AddRecordModal
          onClose={() => setShowAddRecordModal(false)}
          onSuccess={() => {
            setShowAddRecordModal(false);
            loadPatientDashboard();
          }}
        />
      )}

      {showDigiLockerModal && (
        <DigiLockerModal
          onClose={() => setShowDigiLockerModal(false)}
          onSuccess={() => {
            setShowDigiLockerModal(false);
            loadPatientDashboard();
          }}
        />
      )}

      {reviewRequest && (
        <ReviewConsentModal
          request={reviewRequest}
          onClose={() => setReviewRequest(null)}
          onSuccess={() => {
            setReviewRequest(null);
            loadPatientDashboard();
          }}
        />
      )}

      {showSecurityTests && (
        <SecurityTestModal onClose={() => setShowSecurityTests(false)} />
      )}

      {ehrViewerDoc && (
        <EhrViewerModal
          document={ehrViewerDoc}
          onClose={() => setEhrViewerDoc(null)}
        />
      )}

      {clinicalViewerDocId && (
        <ClinicalDocumentModal
          documentId={clinicalViewerDocId}
          onClose={() => setClinicalViewerDocId(null)}
          onRequestAccess={(id) => {
            setClinicalViewerDocId(null);
            setActiveTab('provider-create-request');
          }}
        />
      )}
    </div>
  );
}
