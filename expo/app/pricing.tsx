import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Crown } from "lucide-react-native";

export default function PricingPage() {
  const router = useRouter();
  const { user, upgradeToPremium } = useAuth();

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      router.back();
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Crown size={48} color="#FFD700" />
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited social stories and premium features
        </Text>
      </View>

      <View style={styles.plans}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planPrice}>$0</Text>
          <Text style={styles.planPeriod}>Forever</Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Check size={20} color="#27AE60" />
              <Text style={styles.featureText}>3 social stories</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#27AE60" />
              <Text style={styles.featureText}>AI-generated content</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#27AE60" />
              <Text style={styles.featureText}>Basic customization</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#27AE60" />
              <Text style={styles.featureText}>PDF export</Text>
            </View>
          </View>

          {!user?.isPremium && (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>Current Plan</Text>
            </View>
          )}
        </View>

        <View style={[styles.planCard, styles.premiumCard]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
          <Text style={styles.planName}>Premium</Text>
          <Text style={styles.planPrice}>$9.99</Text>
          <Text style={styles.planPeriod}>per month</Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Unlimited social stories</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Advanced AI customization</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Priority image generation</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Multiple export formats</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Advanced editing tools</Text>
            </View>
            <View style={styles.feature}>
              <Check size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
          </View>

          {user?.isPremium ? (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>Current Plan</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.faq}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
          <Text style={styles.faqAnswer}>
            Yes, you can cancel your subscription at any time. You&apos;ll continue to have
            access until the end of your billing period.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What happens to my stories if I downgrade?</Text>
          <Text style={styles.faqAnswer}>
            All your created stories will remain accessible. You&apos;ll just be limited to
            creating 3 new stories per month on the free plan.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Is there a family plan?</Text>
          <Text style={styles.faqAnswer}>
            We&apos;re working on family and institutional plans. Contact us for more
            information about bulk pricing.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
  plans: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  premiumCard: {
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  popularBadge: {
    position: "absolute" as const,
    top: -12,
    right: 24,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  planName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#4A90E2",
  },
  planPeriod: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 24,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#2C3E50",
    flex: 1,
  },
  currentPlanBadge: {
    backgroundColor: "#E8F4FD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
  upgradeButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  faq: {
    marginTop: 16,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2C3E50",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    color: "#5D6D7E",
    lineHeight: 22,
  },
});
