// Simple translation system to replace next-intl
const translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    remove: "Remove",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    loading: "Loading...",
    noData: "No data available",
    error: "An error occurred",
    success: "Operation completed successfully",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    active: "Active",
    inactive: "Inactive",
    status: "Status",
    actions: "Actions",
    name: "Name",
    type: "Type",
    createdAt: "Created At",
    updatedAt: "Updated At"
  },
  navigation: {
    dashboard: "Dashboard",
    whatsappAccounts: "WhatsApp Accounts",
    spyNumbers: "Spy Numbers",
    entities: "Entities",
    communications: "Communications",
    whatsappMonitoring: "WhatsApp Monitoring",
    messageFiltering: "Message Filtering",
    administration: "Administration",
    settings: "Settings",
    logout: "Logout"
  },
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    metrics: "Metrics",
    alerts: "Alerts",
    recentActivity: "Recent Activity",
    systemHealth: "System Health",
    quickActions: "Quick Actions",
    whatsappAccountsCard: "WhatsApp Accounts",
    spyNumbersCard: "Spy Numbers",
    messagesCard: "Messages"
  },
  whatsappAccounts: {
    title: "WhatsApp Accounts",
    addAccount: "Add Account",
    accountName: "Account Name",
    phoneNumber: "Phone Number",
    accountType: "Account Type",
    business: "Business",
    messenger: "Messenger",
    status: "Status",
    lastHealthCheck: "Last Health Check",
    messagesSent: "Messages Sent (24h)",
    messagesReceived: "Messages Received (24h)",
    healthCheckStatus: "Health Status",
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    blocked: "Blocked",
    suspended: "Suspended",
    pending: "Pending"
  },
  spyNumbers: {
    title: "Spy Numbers",
    addSpyNumber: "Add Spy Number",
    phoneNumber: "Phone Number",
    groupsMonitored: "Groups Monitored",
    messagesIntercepted: "Messages Intercepted (24h)",
    lastActivity: "Last Activity",
    alertConfig: "Alert Configuration",
    missingFromGroup: "Alert if missing from group",
    inactivityAlert: "Inactivity alert",
    inactivityThreshold: "Inactivity threshold (hours)"
  },
  entities: {
    title: "Entities",
    addEntity: "Add Entity",
    entityHierarchy: "Entity Hierarchy",
    customer: "Customer",
    company: "Company",
    group: "Group",
    subGroup: "Sub-Group",
    identifier: "Identifier",
    identifierType: "Identifier Type",
    e164: "E164",
    cpf: "CPF",
    cnpj: "CNPJ",
    custom: "Custom",
    parent: "Parent",
    children: "Children"
  },
  messages: {
    title: "Messages",
    messageHistory: "Message History",
    from: "From",
    to: "To",
    content: "Content",
    timestamp: "Timestamp",
    messageType: "Type",
    text: "Text",
    image: "Image",
    document: "Document",
    audio: "Audio",
    video: "Video",
    sent: "Sent",
    delivered: "Delivered",
    read: "Read",
    failed: "Failed"
  },
  administration: {
    title: "Administration",
    userManagement: "User Management",
    roleManagement: "Role Management",
    auditLogs: "Audit Logs",
    tenantManagement: "Tenant Management",
    subTenantManagement: "Sub-Tenant Management",
    systemSettings: "System Settings",
    users: "Users",
    roles: "Roles",
    permissions: "Permissions",
    logs: "Logs",
    systemAdmin: "System Administrator",
    tenantAdmin: "Tenant Administrator",
    e164User: "E164 User"
  },
  alerts: {
    accountBlocked: "Account Blocked",
    spyMissing: "Spy Number Missing from Group",
    healthCheckFailed: "Health Check Failed",
    highFailureRate: "High Message Failure Rate",
    quotaExceeded: "Message Quota Exceeded",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    open: "Open",
    acknowledged: "Acknowledged",
    resolved: "Resolved"
  }
};

// Simple translation function
export function useTranslations(namespace: keyof typeof translations) {
  return (key: string) => {
    const keys = key.split('.');
    let value: any = translations[namespace];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
}

// Export translations for direct access
export { translations };
