import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SignUpScreen: React.FC = () => {
  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12 });
    formOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 800 })
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoScale.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: withSpring(formOpacity.value === 1 ? 0 : 20) }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSignUpPress = () => {
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1)
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/(tabs)/home");
  };

  const handleLoginRedirect = () => {
    Haptics.selectionAsync();
    router.push("/login");
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Ionicons name="people" size={80} color="#FFFFFF" />
          <Text style={styles.logoText}>Reunite</Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to stay connected</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#757575"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#757575"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#757575"
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleSignUpPress}>
            <Animated.View style={[styles.button, buttonAnimatedStyle]}>
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLoginRedirect}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 12,
  },
  formContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#D7DBDD",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1A237E",
  },
  button: {
        width: 350,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginText: {
    fontSize: 16,
    color: "#D7DBDD",
    marginTop: 24,
  },
  loginLink: {
    color: "#4A90E2",
    fontWeight: "600",
  },
});

export default SignUpScreen;