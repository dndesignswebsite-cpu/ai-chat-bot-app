
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";

import { login } from "../api/auth";
import { saveToken } from "../storage/authStorage";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await login(email.trim(), password);

      if (!result?.token) {
        throw new Error("Login response did not include a token.");
      }

      await saveToken(result.token);

      // Tell AppNavigator that login is complete.
      onLogin();
    } catch (error) {
      console.log("Login error:", error);

      Alert.alert(
        "Login unsuccessful",
        error.message || "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#101126" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>DN</Text>
          </View>

          <Text style={styles.brandName}>DN DESIGNS</Text>
          <Text style={styles.brandCaption}>ADMIN CONSOLE</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.headingSection}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your conversations.
            </Text>
          </View>

          <Text style={styles.label}>EMAIL ADDRESS</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉</Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#85889B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!loading}
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.label, styles.passwordLabel]}>
            PASSWORD
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>▣</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#85889B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="current-password"
              editable={!loading}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((previous) => !previous)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Text style={styles.eyeText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                Sign In  {"→"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.secureNote}>
            <Text style={styles.secureIcon}>✓</Text>
            <Text style={styles.secureText}>
              Secure access for authorised users
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          DN DESIGNS  ·  CONVERSATION MANAGEMENT
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101126",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 38,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: "#6558F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#6558F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -1,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 3,
  },
  brandCaption: {
    color: "#9294B0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginTop: 7,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 25,
    elevation: 12,
  },
  headingSection: {
    marginBottom: 28,
  },
  welcome: {
    color: "#17182D",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: "#77798C",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  label: {
    color: "#55576D",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 9,
  },
  passwordLabel: {
    marginTop: 21,
  },
  inputWrapper: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E7EF",
    backgroundColor: "#F8F9FC",
    borderRadius: 13,
    paddingHorizontal: 14,
  },
  inputIcon: {
    width: 27,
    color: "#7770EC",
    fontSize: 17,
    textAlign: "left",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#202137",
    fontSize: 14,
    paddingHorizontal: 5,
  },
  eyeButton: {
    paddingVertical: 10,
    paddingLeft: 8,
  },
  eyeText: {
    color: "#6558F5",
    fontSize: 12,
    fontWeight: "700",
  },
  loginButton: {
    height: 56,
    borderRadius: 13,
    backgroundColor: "#6558F5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    shadowColor: "#6558F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  secureNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  secureIcon: {
    color: "#16A779",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 7,
  },
  secureText: {
    color: "#85879A",
    fontSize: 11,
  },
  footer: {
    color: "#777991",
    fontSize: 9,
    letterSpacing: 1.1,
    textAlign: "center",
    marginTop: 27,
  },
});
