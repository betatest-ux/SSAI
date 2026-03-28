import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, BookOpen, Crown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { MenuDrawer } from "./MenuDrawer";

type HeaderProps = {
  showBackButton?: boolean;
};

export function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonScale] = useState(new Animated.Value(1));

  const handleNavigate = (path: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(path as any);
  };

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.sequence([
      Animated.timing(menuButtonScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(menuButtonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    
    setMenuVisible(true);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View style={{ transform: [{ scale: menuButtonScale }] }}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <Menu size={22} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => handleNavigate(isAuthenticated ? "/home" : "/")}
            activeOpacity={0.7}
          >
            <View style={styles.logo}>
              <BookOpen size={22} color="#3B82F6" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoText}>SocialStoryAI</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            {isAuthenticated && user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={14} color="#F59E0B" />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
            {!isAuthenticated && (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => handleNavigate("/auth")}
                activeOpacity={0.8}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 40 : 12,
    maxWidth: 1200,
    marginHorizontal: "auto" as any,
    width: "100%",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -80 }],
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 44,
    justifyContent: "flex-end",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#D97706",
    letterSpacing: 0.5,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
});
