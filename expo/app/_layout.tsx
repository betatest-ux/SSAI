import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="create-story" options={{ title: "Create Story" }} />
      <Stack.Screen name="story/[id]" options={{ title: "Story" }} />
      <Stack.Screen name="my-stories" options={{ title: "My Stories" }} />
      <Stack.Screen name="pricing" options={{ title: "Pricing" }} />
      <Stack.Screen name="about" options={{ title: "About Social Stories" }} />
      <Stack.Screen name="admin" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="install" options={{ title: "Installation Guide" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="contact" options={{ title: "Contact Us" }} />
      <Stack.Screen name="faq" options={{ title: "FAQ" }} />
      <Stack.Screen name="terms" options={{ title: "Terms of Service" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
