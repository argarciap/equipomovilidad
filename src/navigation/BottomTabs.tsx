/**
 * Bottom tab navigator with role-based tab visibility.
 *
 * Tabs hidden for SOLO_LECTURA: Fichaje, Incidencias.
 *
 * Requisitos: 4.4, 6.1, 6.6
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { TAB_VISIBILITY, hasAccess } from '../utils/roles';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ClockScreen } from '../screens/ClockScreen';
import { RecordsStackNavigator } from './RecordsStackNavigator';
import { IncidentsStackNavigator } from './IncidentsStackNavigator';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Dashboard', label: 'Inicio', icon: '🏠', component: DashboardScreen },
  { name: 'Clock', label: 'Fichaje', icon: '⏰', component: ClockScreen },
  { name: 'Records', label: 'Registros', icon: '📋', component: RecordsStackNavigator },
  { name: 'Incidents', label: 'Incidencias', icon: '⚠️', component: IncidentsStackNavigator },
] as const;

export function BottomTabs(): React.JSX.Element {
  const { user } = useAuth();
  const role = user?.role;

  const visibleTabs = TAB_CONFIG.filter(
    (tab) => role && hasAccess(role, TAB_VISIBILITY[tab.name] ?? [])
  );

  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      {visibleTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: () => <Text>{tab.icon}</Text>,
            headerShown: tab.name !== 'Incidents' && tab.name !== 'Records',
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
