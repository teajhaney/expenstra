import { useDashboardStore } from '@/stores/dashboardStore';
import { useLogsStore } from '@/stores/logsStore';
import { useReferenceStore } from '@/stores/referenceStore';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const db = useSQLiteContext();

  // Reference store
  const initializeReferenceRepo = useReferenceStore(
    state => state.initializeRepo
  );
  const refreshReference = useReferenceStore(state => state.refresh);

  // Dashboard store
  const initializeDashboardRepo = useDashboardStore(
    state => state.initializeRepo
  );
  const refreshDashboard = useDashboardStore(state => state.refresh);

  // Logs store
  const initializeLogsRepo = useLogsStore(state => state.initializeRepo);
  const refreshLogs = useLogsStore(state => state.refresh);

  useEffect(() => {
    // Initialize all repositories with the database
    initializeReferenceRepo(db);
    initializeDashboardRepo(db);
    initializeLogsRepo(db);

    // Load initial data
    refreshReference();
    refreshDashboard();
    refreshLogs();
  }, [
    db,
    initializeReferenceRepo,
    refreshReference,
    initializeDashboardRepo,
    refreshDashboard,
    initializeLogsRepo,
    refreshLogs,
  ]);

  return <>{children}</>;
}
