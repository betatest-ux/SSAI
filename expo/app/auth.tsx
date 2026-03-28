import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, register, loginWithGoogle, isLoggingIn, isRegistering, loginError, registerError } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      console.log('Starting authentication:', isLogin ? 'login' : 'register', email);
      if (isLogin) {
        const result = await login({ email, password });
        console.log('Login successful:', result);
      } else {
        const result = await register({ email, password, name });
        console.log('Register successful:', result);
      }
      setTimeout(() => {
        router.replace("/home" as any);
      }, 100);
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.message || "Authentication failed";
      if (errorMessage.includes('Invalid login credentials')) {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      } else if (errorMessage.includes('User already registered')) {
        Alert.alert("Registration Failed", "This email is already registered. Please sign in instead.");
      } else if (errorMessage.includes('Email not confirmed')) {
        Alert.alert("Email Not Confirmed", "Please check your email to confirm your account.");
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login');
      await loginWithGoogle();
      console.log('Google login completed, redirecting to home');
      setTimeout(() => {
        router.replace("/home" as any);
      }, 100);
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.message || "Google login failed";
      if (errorMessage.includes('not configured') || errorMessage.includes('not available')) {
        Alert.alert(
          "Google Login Unavailable", 
          "Google login is currently not configured. Please use email and password to sign in."
        );
      } else if (errorMessage.includes('cancelled')) {
        console.log('User cancelled Google login');
      } else {
        Alert.alert("Google Login Failed", errorMessage);
      }
    }
  };

  const isLoading = isLoggingIn || isRegistering;
  const error = loginError || registerError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X size={28} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? "Sign in to continue creating social stories"
            : "Start with 3 free stories"}
        </Text>

        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#BDC3C7"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#BDC3C7"
            secureTextEntry
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Sign In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <View style={styles.googleButtonContent}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchTextBold}>
              {isLogin ? "Sign Up" : "Sign In"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  header: {
    padding: 16,
    paddingTop: 50,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchText: {
    fontSize: 15,
    color: "#7F8C8D",
  },
  switchTextBold: {
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
  dividerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E1E8ED",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "500" as const,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  googleButtonContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DB4437",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  googleButtonText: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
