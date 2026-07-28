import { Stack } from "expo-router";

export default function UsersLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: "User Details" }} />
    </Stack>
  );
}
