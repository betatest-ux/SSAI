import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Mail, MessageCircle, Send, User, CheckCircle } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const submitMutation = trpc.contact.submit.useMutation();

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (message.length < 10) {
      Alert.alert("Error", "Message must be at least 10 characters long");
      return;
    }

    try {
      handleHaptic();
      await submitMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Animated.View 
          style={[
            styles.successContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <CheckCircle size={48} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successText}>
            Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => {
              handleHaptic();
              router.back();
            }}
          >
            <Text style={styles.successButtonText}>Back to App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.anotherButton}
            onPress={() => {
              setSubmitted(false);
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                  toValue: 0,
                  tension: 50,
                  friction: 9,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
          >
            <Text style={styles.anotherButtonText}>Send Another Message</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Mail size={36} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Get in Touch</Text>
          <Text style={styles.subtitle}>
            Have a question or need support? We&apos;re here to help!
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.form,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={18} color="#64748B" />
              <Text style={styles.labelText}>Your Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={18} color="#64748B" />
              <Text style={styles.labelText}>Email Address</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MessageCircle size={18} color="#64748B" />
              <Text style={styles.labelText}>Subject</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="What can we help you with?"
              placeholderTextColor="#94A3B8"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <MessageCircle size={18} color="#64748B" />
              <Text style={styles.labelText}>Message</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us more about your inquiry..."
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
            activeOpacity={0.8}
          >
            {submitMutation.isPending ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.infoTitle}>Other Ways to Reach Us</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={18} color="#3B82F6" />
              <Text style={styles.infoText}>support@socialstoryai.com</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Response Time:</Text>
              <Text style={styles.infoValue}>24-48 hours</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#334155",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  infoSection: {
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#0F172A",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500" as const,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500" as const,
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600" as const,
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  anotherButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  anotherButtonText: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
