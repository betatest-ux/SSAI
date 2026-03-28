import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Plus, Crown, Sparkles, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Header } from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, remainingFreeStories } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [createButtonScale] = useState(new Animated.Value(1));
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, slideAnim, cardAnims]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleLightHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Sparkles size={32} color="#3B82F6" />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const remaining = remainingFreeStories();

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingSmall}>Welcome back,</Text>
            <Text style={styles.greeting}>{user.name}</Text>
          </View>
          
          {!user.isPremium && remaining !== null && (
            <View style={styles.storiesCounter}>
              <View style={styles.counterCircle}>
                <Text style={styles.counterNumber}>{remaining}</Text>
              </View>
              <Text style={styles.counterText}>
                free {remaining === 1 ? "story" : "stories"} left
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.createSection,
            {
              opacity: cardAnims[0],
              transform: [{ 
                translateY: cardAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: createButtonScale }] }}>
            <TouchableOpacity
              style={styles.createCard}
              onPress={() => {
                handleHaptic();
                animateButton(createButtonScale);
                router.push("/create-story" as any);
              }}
              activeOpacity={0.95}
            >
              <View style={styles.createCardGlow} />
              <View style={styles.createCardContent}>
                <View style={styles.createCardIcon}>
                  <Plus size={28} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={styles.createCardText}>
                  <Text style={styles.createCardTitle}>Create New Story</Text>
                  <Text style={styles.createCardSubtitle}>
                    Generate a personalized social story
                  </Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: cardAnims[1],
              transform: [{ 
                translateY: cardAnims[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              handleLightHaptic();
              router.push("/my-stories" as any);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: "#EFF6FF" }]}>
              <BookOpen size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionCardTitle}>My Stories</Text>
            <Text style={styles.actionCardSubtitle}>View saved stories</Text>
          </TouchableOpacity>

          {!user.isPremium && (
            <TouchableOpacity
              style={[styles.actionCard, styles.premiumCard]}
              onPress={() => {
                handleLightHaptic();
                router.push("/pricing" as any);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Crown size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionCardTitle}>Go Premium</Text>
              <Text style={styles.actionCardSubtitle}>Unlimited stories</Text>
            </TouchableOpacity>
          )}

          {user.isPremium && (
            <TouchableOpacity
              style={[styles.actionCard, styles.premiumActiveCard]}
              onPress={() => {
                handleLightHaptic();
                router.push("/settings" as any);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Crown size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionCardTitle}>Premium Active</Text>
              <Text style={styles.actionCardSubtitle}>Manage subscription</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: cardAnims[2],
              transform: [{ 
                translateY: cardAnims[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }],
            },
          ]}
        >
          <View style={styles.infoHeader}>
            <Sparkles size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>What are Social Stories?</Text>
          </View>
          <Text style={styles.infoText}>
            Social stories help individuals with autism understand social situations,
            expectations, and appropriate responses through simple, personalized narratives.
          </Text>
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={() => {
              handleLightHaptic();
              router.push("/about" as any);
            }} 
            activeOpacity={0.7}
          >
            <Text style={styles.learnMoreLink}>Learn more</Text>
            <ChevronRight size={18} color="#3B82F6" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500" as const,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingSmall: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  storiesCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  counterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  counterNumber: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  counterText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#64748B",
  },
  createSection: {
    marginBottom: 20,
  },
  createCard: {
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createCardGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  createCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  createCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  createCardText: {
    flex: 1,
  },
  createCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  createCardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500" as const,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  premiumCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  premiumActiveCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0F172A",
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500" as const,
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0F172A",
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  learnMoreLink: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#3B82F6",
  },
});
