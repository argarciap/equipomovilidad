import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/auth/AuthContext';
import { hasAccess, TAB_VISIBILITY } from '@/utils/roles';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { ClockScreen } from '@/screens/ClockScreen';
import { RecordsScreen } from '@/screens/RecordsScreen';
import { IncidentsStackNavigator } from '@/navigation/IncidentsStackNavigator';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Clock: '⏰',
  Records: '📋',
  Incidents: '⚠️',
};

const TAB_LABELS: Record<string, string> = {
  Dashboard: 'Inicio',
  Clock: 'Fichaje',
  Records: 'Registros',
  Incidents: 'Incidencias',
};

export function BottomTabs(): React.JSX.Element {
  const { user } = useAuth();
  const role = user?.role ?? 'SOLO_LECTURA';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => (
          <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name] ?? '📄'}</Text>
        ),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
        headerShown: route.name !== 'Incidents',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      {hasAccess(role, TAB_VISIBILITY.Clock) && (
        <Tab.Screen name="Clock" component={ClockScreen} />
      )}
      <Tab.Screen name="Records" component={RecordsScreen} />
      {hasAccess(role, TAB_VISIBILITY.Incidents) && (
        <Tab.Screen name="Incidents" component={IncidentsStackNavigator} />
      )}
    </Tab.Navigator>
  );
}
