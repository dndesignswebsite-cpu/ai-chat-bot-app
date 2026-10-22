
import React from "react";

import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ChatListItem({ chat, onPress }) {
  const messages = chat.messages || [];
  const lastMessage = messages[messages.length - 1];

  const visitor = String(chat.visitorId || "Unknown Visitor");
  const initials = visitor
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase() || "??";

  const preview = lastMessage?.content || "No messages yet";
  const messageCount = chat.messageCount ?? messages.length;

  const dateValue =
    chat.lastMessageAt || chat.updatedAt || chat.startedAt;

  const formattedTime = dateValue
    ? formatTime(dateValue)
    : "";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.visitor} numberOfLines={1}>
            {visitor}
          </Text>

          <Text style={styles.time}>{formattedTime}</Text>
        </View>

        <Text style={styles.conversationId} numberOfLines={1}>
          ID: {chat.conversationId || chat._id}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.message} numberOfLines={2}>
            {preview}
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {messageCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#ECEEF5",
  },
  avatar: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: "#E9E9FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4F46E5",
  },
  onlineDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    right: -1,
    bottom: -1,
    backgroundColor: "#16B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  visitor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#202236",
  },
  time: {
    fontSize: 10,
    color: "#969BAD",
  },
  conversationId: {
    fontSize: 10,
    color: "#969BAD",
    marginTop: 4,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#777D91",
  },
  countBadge: {
    minWidth: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: "#F0F0FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4F46E5",
  },
});
