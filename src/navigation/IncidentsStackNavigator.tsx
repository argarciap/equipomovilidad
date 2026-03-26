import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { IncidentListScreen } from '../screens/incidents/IncidentListScreen';
import { CreateIncidentScreen } from '../screens/incidents/CreateIncidentScreen';
import { IncidentDetailScreen } from '../screens/incidents/IncidentDetailScreen';
import { MockIncidentService } from '../services/MockIncidentService';
import { colors } from '../theme';

export type IncidentsStackParamList = {
  IncidentList: undefined;
  IncidentDetail: { incidentId: string };
  CreateIncident: undefined;
};

const Stack = createNativeStackNavigator<IncidentsStackParamList>();

// Workers from mock-data.json — used by MockIncidentService for role filtering
const MOCK_WORKERS = [
  { id: 'd1b2c3d4-0004-0004-0004-000000000001', first_name: 'Pedro', last_name: 'Fernández', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000002', first_name: 'María', last_name: 'Ruiz', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000003', first_name: 'Alexandru', last_name: 'Popescu', team_id: 'c1b2c3d4-0003-0003-0003-000000000002' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000004', first_name: 'Lucía', last_name: 'Sánchez', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
];

export const IncidentsStackNavigator: React.FC = () => {
  const { user } = useAuth();

  const currentUser = useMemo(
    () => (user ? { id: user.id, role: user.role } : null),
    [user],
  );

  const incidentService = useMemo(
    () => new MockIncidentService(() => currentUser, MOCK_WORKERS),
    [currentUser],
  );

  return (
    <Stack.Navigator
      initialRouteName="IncidentList"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen name="IncidentList" options={{ title: 'Incidencias' }}>
        {(props) => (
          <IncidentListScreen
            {...props}
            incidentService={incidentService}
            user={currentUser ?? { id: '', role: 'TRABAJADOR' }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="IncidentDetail" options={{ title: 'Detalle de Incidencia' }}>
        {(props) => (
          <IncidentDetailScreen
            {...props}
            incidentService={incidentService}
            user={currentUser ?? { id: '', role: 'TRABAJADOR' }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreateIncident" options={{ title: 'Nueva Incidencia' }}>
        {(props) => (
          <CreateIncidentScreen
            {...props}
            incidentService={incidentService}
            userId={currentUser?.id ?? ''}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
