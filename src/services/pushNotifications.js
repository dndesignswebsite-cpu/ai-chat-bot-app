
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import { registerPushToken } from "../api/push";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupPushNotifications(authToken) {
  try {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device.");
      return null;
    }

    if (!authToken) {
      console.log("User is not authenticated.");
      return null;
    }

    // Create Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("new-chats", {
        name: "New Chat Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
        // sound: "default",
      });
    }

    // Check and request notification permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted.");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error("Expo EAS project ID is missing.");
    }

    // Get Expo push token
    const pushTokenData =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const pushToken = pushTokenData.data;

    console.log("Expo Push Token:", pushToken);

    // Register token on website backend
    const result = await registerPushToken(
      authToken,
      pushToken,
      Platform.OS
    );

    console.log("Push token registered:", result);

    return pushToken;
  } catch (error) {
    console.error("Push Setup Error:", error);
    return null;
  }
}

export function usePushNotifications(authToken) {
  useEffect(() => {
    if (!authToken) return;

    setupPushNotifications(authToken);
  }, [authToken]);
}
