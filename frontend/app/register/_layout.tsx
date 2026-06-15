import { Stack } from 'expo-router';

export default function RegisterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="gst" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="otp-phone" />
      <Stack.Screen name="otp-email" />
      <Stack.Screen name="password" />
    </Stack>
  );
}
