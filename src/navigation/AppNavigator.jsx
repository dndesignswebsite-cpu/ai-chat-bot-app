import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import ChatsScreen from "../screens/ChatsScreen";
import ChatDetailsScreen from "../screens/ChatDetailsScreen";

import {
  getToken,
  removeToken,
} from "../storage/authStorage";

import { usePushNotifications } from "../services/pushNotifications";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Register push notifications whenever a valid login token is available.
  usePushNotifications(authToken);

  useEffect(() => {
    let mounted = true;

    const checkLogin = async () => {
      try {
        const token = await getToken();

        if (mounted) {
          setAuthToken(token);
          setIsLoggedIn(Boolean(token));
        }
      } catch (error) {
        console.log("Session check error:", error);

        if (mounted) {
          setAuthToken(null);
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkLogin();

    return () => {
      mounted = false;
    };
  }, []);

  // Called after successful login.
  const handleLogin = async () => {
    try {
      const token = await getToken();

      setAuthToken(token);
      setIsLoggedIn(Boolean(token));
    } catch (error) {
      console.log("Login token error:", error);
      Alert.alert("Error", "Unable to load your login session.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);

              await removeToken();

              setAuthToken(null);
              setIsLoggedIn(false);
            } catch (error) {
              console.log("Logout error:", error);

              Alert.alert(
                "Logout Failed",
                "Unable to logout. Please try again."
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (checkingAuth || loggingOut) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#101126"
        />

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>DN</Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#8177FF"
          style={styles.loader}
        />

        <Text style={styles.loadingText}>
          {loggingOut
            ? "Signing you out..."
            : "Preparing your workspace..."}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: "#202137",
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "700",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#F6F7FB",
          },
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="Chats"
              component={ChatsScreen}
              options={{
                title: "Conversations",
                headerBackVisible: false,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    style={styles.logoutButton}
                    accessibilityRole="button"
                    accessibilityLabel="Logout"
                  >
                    <Text style={styles.logoutIcon}>⇥</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                ),
              }}
            />

            <Stack.Screen
              name="ChatDetails"
              component={ChatDetailsScreen}
              options={{
                title: "Conversation",
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            options={{
              headerShown: false,
            }}
          >
            {(props) => (
              <LoginScreen
                {...props}
                onLogin={handleLogin}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#101126",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBox: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: "#6558F5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  loader: {
    marginTop: 28,
  },
  loadingText: {
    color: "#B4B5CB",
    fontSize: 13,
    marginTop: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F0FF",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 2,
  },
  logoutIcon: {
    color: "#6558F5",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 5,
  },
  logoutText: {
    color: "#6558F5",
    fontSize: 12,
    fontWeight: "800",
  },
});