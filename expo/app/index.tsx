import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Heart, Shield, Zap, Users, ArrowRight, CheckCircle2, Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Header } from "@/components/Header";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 15,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/home" as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const testimonials = [
    { text: "This app has transformed how we help our son understand social situations.", author: "Parent" },
    { text: "The AI-generated stories are perfectly tailored and easy to understand.", author: "Teacher" },
    { text: "Finally, a tool that truly understands neurodivergent needs.", author: "Therapist" },
  ];

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.badgeContainer}>
            <Shield size={14} color="#27AE60" />
            <Text style={styles.badgeText}>Trusted by Families Worldwide</Text>
          </View>
          <Text style={styles.title}>Create Personalized{"\n"}Social Stories with AI</Text>
          <Text style={styles.subtitle}>
            Empower autistic individuals with custom stories that build understanding, confidence, and social skills.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.ctaButtons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/auth" as any);
            }}
          >
            <Text style={styles.primaryButtonText}>Start Free Trial</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/about" as any);
            }}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>

          <View style={styles.trustBadge}>
            <Star size={16} color="#F39C12" fill="#F39C12" />
            <Text style={styles.trustBadgeText}>3 free stories • No credit card required</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Stories Created</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>95%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5K+</Text>
          <Text style={styles.statLabel}>Happy Families</Text>
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose SocialStoryAI?</Text>
        <Text style={styles.sectionSubtitle}>Everything you need to create effective social stories</Text>

        <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Sparkles size={24} color="#6C5CE7" />
            </View>
            <Text style={styles.featureTitle}>AI-Powered Generation</Text>
            <Text style={styles.featureText}>
              Advanced AI creates personalized stories tailored to your child&apos;s needs and situation
            </Text>
            <View style={styles.featureCheckmarks}>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Custom scenarios</Text>
              </View>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Age-appropriate language</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: "#FFE9E9" }]}>
              <Heart size={24} color="#E74C3C" />
            </View>
            <Text style={styles.featureTitle}>Autism-Friendly Design</Text>
            <Text style={styles.featureText}>
              Built with input from therapists and educators specializing in autism support
            </Text>
            <View style={styles.featureCheckmarks}>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Visual support</Text>
              </View>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Clear, simple language</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: "#E8F8F5" }]}>
              <Zap size={24} color="#27AE60" />
            </View>
            <Text style={styles.featureTitle}>Quick & Easy</Text>
            <Text style={styles.featureText}>
              Generate complete social stories in seconds, with images and customizable options
            </Text>
            <View style={styles.featureCheckmarks}>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Instant generation</Text>
              </View>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Easy editing</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: "#FFF9E6" }]}>
              <Users size={24} color="#F39C12" />
            </View>
            <Text style={styles.featureTitle}>Proven Approach</Text>
            <Text style={styles.featureText}>
              Based on evidence-based social story methodology recognized by professionals
            </Text>
            <View style={styles.featureCheckmarks}>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Research-backed</Text>
              </View>
              <View style={styles.checkmarkRow}>
                <CheckCircle2 size={16} color="#27AE60" />
                <Text style={styles.checkmarkText}>Professional approved</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.testimonialSection}>
        <Text style={styles.sectionTitle}>Loved by Families & Educators</Text>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>&ldquo;{testimonials[activeTestimonial].text}&rdquo;</Text>
          <Text style={styles.testimonialAuthor}>— {testimonials[activeTestimonial].author}</Text>
          <View style={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeTestimonial && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.steps}>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Describe the Situation</Text>
            <Text style={styles.stepText}>Tell us about the social situation or challenge</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>AI Creates the Story</Text>
            <Text style={styles.stepText}>Our AI generates a personalized social story with images</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Review & Share</Text>
            <Text style={styles.stepText}>Edit if needed, then share or print the story</Text>
          </View>
        </View>
      </View>

      <View style={styles.finalCTA}>
        <View style={styles.finalCTAContent}>
          <Text style={styles.finalCTATitle}>Ready to Get Started?</Text>
          <Text style={styles.finalCTAText}>Join thousands of families creating personalized social stories</Text>
          <TouchableOpacity
            style={styles.finalCTAButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/auth" as any);
            }}
          >
            <Text style={styles.finalCTAButtonText}>Start Your Free Trial</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingBottom: 0,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: "#FAFBFC",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#27AE60",
  },
  title: {
    fontSize: 42,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 17,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 16,
    fontWeight: "400" as const,
  },
  ctaButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#4A5568",
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  trustBadgeText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500" as const,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "400" as const,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F4ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    color: "#718096",
    lineHeight: 22,
    marginBottom: 16,
  },
  featureCheckmarks: {
    gap: 8,
  },
  checkmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkmarkText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500" as const,
  },
  testimonialSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#FAFBFC",
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  testimonialText: {
    fontSize: 18,
    color: "#2D3748",
    lineHeight: 28,
    fontStyle: "italic" as const,
    marginBottom: 16,
    textAlign: "center",
  },
  testimonialAuthor: {
    fontSize: 15,
    color: "#718096",
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 20,
  },
  testimonialDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  dotActive: {
    backgroundColor: "#4A90E2",
    width: 24,
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#FFFFFF",
  },
  steps: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: "#FAFBFC",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 8,
    textAlign: "center",
  },
  stepText: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
  },
  finalCTA: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 56,
  },
  finalCTAContent: {
    alignItems: "center",
  },
  finalCTATitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  finalCTAText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 28,
    opacity: 0.9,
  },
  finalCTAButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  finalCTAButtonText: {
    color: "#4A90E2",
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
});
