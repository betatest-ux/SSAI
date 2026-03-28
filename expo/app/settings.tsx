import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, Mail, Crown, Calendar, ArrowLeft, Save } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, changePassword, cancelSubscription } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Invalid Name", "Name must be at least 2 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProfile({ name, email });
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await changePassword({ currentPassword, newPassword });
      Alert.alert("Success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your premium subscription? You will lose access to premium features.",
      [
        { text: "No, Keep Premium", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await cancelSubscription();
              Alert.alert("Subscription Cancelled", "Your subscription has been cancelled");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel subscription");
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const subscriptionDate = user.subscriptionEndDate
    ? new Date(user.subscriptionEndDate).toLocaleDateString()
    : null;

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
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user.isPremium && (
          <View style={styles.premiumBanner}>
            <Crown size={24} color="#FFD700" />
            <View style={styles.premiumBannerText}>
              <Text style={styles.premiumBannerTitle}>Premium Member</Text>
              {subscriptionDate && (
                <Text style={styles.premiumBannerSubtitle}>
                  Renews on {subscriptionDate}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={20} color="#718096" />
              <Text style={styles.inputLabelText}>Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={20} color="#718096" />
              <Text style={styles.inputLabelText}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={20} color="#718096" />
              <Text style={styles.inputLabelText}>Current Password</Text>
            </View>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={20} color="#718096" />
              <Text style={styles.inputLabelText}>New Password</Text>
            </View>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Lock size={20} color="#718096" />
              <Text style={styles.inputLabelText}>Confirm New Password</Text>
            </View>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
          >
            <Lock size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {user.isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.subscriptionCard}>
              <Calendar size={24} color="#4A90E2" />
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>Premium Subscription</Text>
                <Text style={styles.subscriptionSubtitle}>
                  Unlimited stories and video generation
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
            >
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.accountInfo}>Stories generated: {user.storiesGenerated}</Text>
          {!user.isPremium && (
            <Text style={styles.accountInfo}>
              Free stories remaining: {3 - user.storiesGenerated}
            </Text>
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontSize: 16,
    color: "#718096",
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
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFE9B3",
  },
  premiumBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#F39C12",
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: "#D68910",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4A5568",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A202C",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  subscriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  subscriptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: "#718096",
  },
  cancelButton: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#E74C3C",
  },
  accountInfo: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
});
