import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { TailwindProvider } from 'tailwindcss-react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './StackNavigation';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <NavigationContainer>
      <TailwindProvider>
        <AuthProvider>
          <StackNavigation />
        </AuthProvider>
      </TailwindProvider>
    </NavigationContainer>
  );
}