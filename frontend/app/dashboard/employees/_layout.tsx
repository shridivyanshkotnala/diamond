import { Stack } from 'expo-router';

export default function EmployeesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="permissions-extra" />
      <Stack.Screen name="create-password" />
    </Stack>
  );
}
