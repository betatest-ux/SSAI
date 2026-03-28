import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Server, Database, Key, Package, Terminal, CheckCircle2, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function InstallationGuidePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Installation Guide</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Deploy SocialStoryAI</Text>
          <Text style={styles.introText}>
            Follow this comprehensive guide to deploy SocialStoryAI on your own server. This guide covers all necessary steps from prerequisites to production deployment.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Prerequisites</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.requirementRow}>
              <CheckCircle2 size={18} color="#27AE60" />
              <Text style={styles.requirementText}>Node.js 18+ installed</Text>
            </View>
            <View style={styles.requirementRow}>
              <CheckCircle2 size={18} color="#27AE60" />
              <Text style={styles.requirementText}>npm or yarn package manager</Text>
            </View>
            <View style={styles.requirementRow}>
              <CheckCircle2 size={18} color="#27AE60" />
              <Text style={styles.requirementText}>Git for version control</Text>
            </View>
            <View style={styles.requirementRow}>
              <CheckCircle2 size={18} color="#27AE60" />
              <Text style={styles.requirementText}>Basic terminal/command line knowledge</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>1. Database Setup</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Configure SurrealDB</Text>
            <Text style={styles.stepDescription}>
              This app uses SurrealDB as its database. You&apos;ll need to set up a SurrealDB instance.
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                # Environment variables needed:{"\n"}
                EXPO_PUBLIC_RORK_DB_ENDPOINT=your-db-endpoint{"\n"}
                EXPO_PUBLIC_RORK_DB_NAMESPACE=your-namespace{"\n"}
                EXPO_PUBLIC_RORK_DB_TOKEN=your-token
              </Text>
            </View>
            <View style={styles.noteBox}>
              <AlertCircle size={16} color="#F39C12" />
              <Text style={styles.noteText}>
                The database is automatically initialized on first run. No manual schema setup required.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Terminal size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>2. Installation Steps</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Clone the Repository</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>
                    git clone your-repo-url{"\n"}
                    cd socialstoryai
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Install Dependencies</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>npm install</Text>
                </View>
                <Text style={styles.stepNote}>or if using yarn:</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>yarn install</Text>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Configure Environment Variables</Text>
                <Text style={styles.stepDescription}>
                  Create a .env file in the root directory with required variables.
                </Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>
                    EXPO_PUBLIC_RORK_DB_ENDPOINT=your-endpoint{"\n"}
                    EXPO_PUBLIC_RORK_DB_NAMESPACE=your-namespace{"\n"}
                    EXPO_PUBLIC_RORK_DB_TOKEN=your-token
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Development Server</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>npm start</Text>
                </View>
                <Text style={styles.stepNote}>The app will be available at http://localhost:8081</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>3. API Configuration</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.stepDescription}>
              After deployment, access the Admin Panel to configure API keys for third-party services:
            </Text>
            <View style={styles.apiList}>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>OpenAI API Key - For AI story generation</Text>
              </View>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Google Gemini API Key - Alternative AI provider</Text>
              </View>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Stripe API Keys - For payment processing</Text>
              </View>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Google OAuth Credentials - For social login</Text>
              </View>
            </View>
            <View style={styles.noteBox}>
              <AlertCircle size={16} color="#F39C12" />
              <Text style={styles.noteText}>
                Configure these in the Admin Panel under &quot;API Keys&quot; tab after first admin login.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>4. Production Deployment</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Web Deployment</Text>
            <Text style={styles.stepDescription}>
              Build and export for web deployment:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                npx expo export --platform web{"\n"}
                # Output will be in the dist/ folder
              </Text>
            </View>
            <Text style={styles.stepNote}>
              Deploy the dist/ folder to any static hosting service (Vercel, Netlify, etc.)
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.stepTitle}>Mobile App Deployment</Text>
            <Text style={styles.stepDescription}>
              For iOS and Android app deployment, you&apos;ll need:
            </Text>
            <View style={styles.apiList}>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Expo Application Services (EAS) account</Text>
              </View>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Apple Developer account (for iOS)</Text>
              </View>
              <View style={styles.apiItem}>
                <CheckCircle2 size={16} color="#4A90E2" />
                <Text style={styles.apiItemText}>Google Play Developer account (for Android)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={24} color="#E74C3C" />
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>Database Connection Issues</Text>
              <Text style={styles.troubleshootText}>
                Verify your database credentials and ensure the SurrealDB instance is accessible from your deployment environment.
              </Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>API Key Errors</Text>
              <Text style={styles.troubleshootText}>
                Ensure all API keys are properly configured in the Admin Panel. Check API key permissions and quotas.
              </Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootTitle}>Build Failures</Text>
              <Text style={styles.troubleshootText}>
                Clear node_modules and package-lock.json, then reinstall dependencies. Ensure Node.js version is compatible.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.finalNote}>
            <Text style={styles.finalNoteTitle}>Need Help?</Text>
            <Text style={styles.finalNoteText}>
              For additional support or questions about deployment, consult the project documentation or contact your system administrator.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A202C",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A202C",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  requirementText: {
    fontSize: 15,
    color: "#4A5568",
    flex: 1,
  },
  step: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22,
    marginBottom: 12,
  },
  stepNote: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
    fontStyle: "italic" as const,
  },
  codeBlock: {
    backgroundColor: "#2D3748",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  codeText: {
    fontSize: 13,
    color: "#E2E8F0",
    fontFamily: "monospace",
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FFE9B3",
  },
  noteText: {
    fontSize: 14,
    color: "#D68910",
    flex: 1,
    lineHeight: 20,
  },
  apiList: {
    marginTop: 16,
    gap: 12,
  },
  apiItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  apiItemText: {
    fontSize: 15,
    color: "#4A5568",
    flex: 1,
    lineHeight: 22,
  },
  troubleshootItem: {
    marginBottom: 20,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 6,
  },
  troubleshootText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  finalNote: {
    backgroundColor: "#E8F4FD",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#B3D9F2",
  },
  finalNoteTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  finalNoteText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22,
  },
});
