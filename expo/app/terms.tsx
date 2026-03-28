import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FileText } from "lucide-react-native";

export default function TermsPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FileText size={40} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using SocialStoryAI, you accept and agree to be bound by the terms and provisions of this agreement.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Use License</Text>
        <Text style={styles.paragraph}>
          Permission is granted to temporarily download one copy of the materials on SocialStoryAI for personal, non-commercial transitory viewing only.
        </Text>
        <Text style={styles.paragraph}>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by SocialStoryAI at any time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Free and Premium Accounts</Text>
        <Text style={styles.paragraph}>
          Free accounts are limited to 3 social story generations. Premium accounts provide unlimited generation and access to advanced features.
        </Text>
        <Text style={styles.paragraph}>
          Premium subscriptions are billed monthly and can be canceled at any time. Cancellations take effect at the end of the current billing period.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.paragraph}>
          You retain all rights to the stories you create using our service. SocialStoryAI claims no ownership over user-generated content.
        </Text>
        <Text style={styles.paragraph}>
          You are responsible for ensuring that your use of the service complies with all applicable laws and regulations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
        <Text style={styles.paragraph}>
          You may not use our service for any unlawful purpose, to harass others, or to create content that is offensive, harmful, or violates the rights of others.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          SocialStoryAI shall not be liable for any damages arising from the use or inability to use our service, even if we have been advised of the possibility of such damages.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms of Service, please contact us at support@socialstoryai.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 12,
  },
});
