import { Link, Stack } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#E74C3C" />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The page you&apos;re looking for doesn&apos;t exist.</Text>
        <Link href="/" style={styles.button}>
          <Text style={styles.buttonText}>Go back to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
