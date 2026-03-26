import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { RecordListScreen } from '../screens/records/RecordListScreen';
import { RecordDetailScreen } from '../screens/records/RecordDetailScreen';
import { MockRecordsService } from '../services/MockRecordsService';
import { colors } from '../theme';

export type RecordsStackParamList = {
  RecordList: undefined;
  RecordDetail: { recordId: string };
};

const Stack = createNativeStackNavigator<RecordsStackParamList>();

const MOCK_WORKERS = [
  { id: 'd1b2c3d4-0004-0004-0004-000000000001', first_name: 'Pedro', last_name: 'Fernández', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000002', first_name: 'María', last_name: 'Ruiz', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000003', first_name: 'Alexandru', last_name: 'Popescu', team_id: 'c1b2c3d4-0003-0003-0003-000000000002' },
  { id: 'd1b2c3d4-0004-0004-0004-000000000004', first_name: 'Lucía', last_name: 'Sánchez', team_id: 'c1b2c3d4-0003-0003-0003-000000000001' },
];

export const RecordsStackNavigator: React.FC = () => {
  const { user } = useAuth();
  const currentUser = useMemo(() => (user ? { id: user.id, role: user.role } : null), [user]);
  const recordsService = useMemo(() => new MockRecordsService(() => currentUser, MOCK_WORKERS), [currentUser]);

  return (
    <Stack.Navigator initialRouteName="RecordList" screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary, headerBackTitle: 'Atrás' }}>
      <Stack.Screen name="RecordList" options={{ title: 'Registros' }}>
        {(props) => <RecordListScreen {...props} recordsService={recordsService} />}
      </Stack.Screen>
      <Stack.Screen name="RecordDetail" options={{ title: 'Detalle de Registro' }}>
        {(props) => <RecordDetailScreen {...props} recordsService={recordsService} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
