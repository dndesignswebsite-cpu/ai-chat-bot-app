
import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <View
      style={[
        styles.wrapper,
        isUser ? styles.userWrapper : styles.botWrapper,
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>✦</Text>
        </View>
      )}

      <View style={styles.messageArea}>
        <Text
          style={[
            styles.sender,
            isUser && styles.userSender,
          ]}
        >
          {isUser ? "Visitor" : "AI Assistant"}
        </Text>

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
            ]}
            selectable
          >
            {message.content}
          </Text>
        </View>

        <Text
          style={[
            styles.time,
            isUser && styles.userTime,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: 9,
    paddingHorizontal: 5,
    alignItems: "flex-end",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  botWrapper: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: "#E9E9FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    marginBottom: 19,
  },
  botAvatarText: {
    color: "#4F46E5",
    fontSize: 16,
  },
  messageArea: {
    maxWidth: "83%",
  },
  sender: {
    fontSize: 10,
    fontWeight: "700",
    color: "#85899B",
    marginBottom: 6,
    marginLeft: 3,
  },
  userSender: {
    color: "#6366F1",
    textAlign: "right",
    marginRight: 3,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 17,
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#ECEEF5",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#303449",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  time: {
    fontSize: 10,
    color: "#A0A4B4",
    marginTop: 6,
    marginLeft: 4,
  },
  userTime: {
    textAlign: "right",
    marginRight: 4,
  },
});
