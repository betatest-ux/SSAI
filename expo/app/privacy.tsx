import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Shield } from "lucide-react-native";

export default function PrivacyPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={40} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, including name, email address, and the content of social stories you create.
        </Text>
        <Text style={styles.paragraph}>
          We also collect usage data such as pages visited, features used, and time spent on the platform to improve our service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.listItem}>• Provide and improve our services</Text>
        <Text style={styles.listItem}>• Process your transactions</Text>
        <Text style={styles.listItem}>• Send you updates and notifications</Text>
        <Text style={styles.listItem}>• Respond to your questions and support requests</Text>
        <Text style={styles.listItem}>• Analyze usage patterns to enhance user experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your personal information. All sensitive data, including passwords, is encrypted using bcrypt encryption.
        </Text>
        <Text style={styles.paragraph}>
          We use secure HTTPS connections and store data in protected databases with access controls.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </Text>
        <Text style={styles.listItem}>• With your consent</Text>
        <Text style={styles.listItem}>• To comply with legal obligations</Text>
        <Text style={styles.listItem}>• To protect our rights and safety</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use third-party services for payment processing (Stripe), authentication (Google OAuth), and AI generation (OpenAI/Google Gemini). These services have their own privacy policies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.listItem}>• Access your personal data</Text>
        <Text style={styles.listItem}>• Correct inaccurate information</Text>
        <Text style={styles.listItem}>• Request deletion of your account and data</Text>
        <Text style={styles.listItem}>• Opt out of marketing communications</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Children&apos;s Privacy</Text>
        <Text style={styles.paragraph}>
          While our service is designed to help children with autism, it is intended for use by adults. We do not knowingly collect personal information from children under 13 without parental consent.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy, please contact us at privacy@socialstoryai.com
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
  listItem: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
    marginLeft: 16,
  },
});
