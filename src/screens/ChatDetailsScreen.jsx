
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { getChatById } from "../api/chats";
import MessageBubble from "../components/MessageBubble";

const formatDate = (value) => {
  if (!value) return "Conversation";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Conversation";

  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ChatDetailsScreen({ route }) {
  const { chatId } = route.params;
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadChat = useCallback(async (refresh = false) => {
    try {
      setError("");
      if (refresh) setRefreshing(true);

      const result = await getChatById(chatId);
      setChat(result.data);
    } catch (err) {
      console.log("Chat detail error:", err);
      setError(err.message || "Unable to load conversation.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const messages = chat?.messages || [];
  const visitor = String(chat?.visitorId || "Unknown Visitor");

  const initials =
    visitor.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "??";

  const timeline = [];

  messages.forEach((message, index) => {
    const dateLabel = formatDate(message.createdAt);

    if (
      index === 0 ||
      dateLabel !== formatDate(messages[index - 1].createdAt)
    ) {
      timeline.push({
        type: "date",
        id: `date-${index}`,
        label: dateLabel,
      });
    }

    timeline.push({
      type: "message",
      id: message._id || `message-${index}`,
      message,
    });
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Conversation unavailable</Text>
        <Text style={styles.errorText}>
          {error || "Chat not found."}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadChat()}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.visitor} numberOfLines={1}>
            {visitor}
          </Text>
          <Text style={styles.headerSubtitle}>
            Website conversation
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => loadChat(true)}
          disabled={refreshing}
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoTop}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>✦</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI Chat Conversation</Text>
            <Text style={styles.infoSubtitle}>
              Website chatbot history jehdf
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {chat.messageCount ?? messages.length} msgs
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>CONVERSATION ID</Text>
        <Text style={styles.conversationId} selectable>
          {chat.conversationId || chat._id}
        </Text>
      </View>

      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Conversation history</Text>
        <Text style={styles.timelineCount}>
          {messages.length} messages
        </Text>
      </View>

      {error ? (
        <Text style={styles.refreshError}>{error}</Text>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={timeline}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          if (item.type === "date") {
            return (
              <View style={styles.dateWrapper}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>{item.label}</Text>
                <View style={styles.dateLine} />
              </View>
            );
          }

          return <MessageBubble message={item.message} />;
        }}
        contentContainerStyle={styles.messages}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadChat(true)}
            tintColor="#4F46E5"
          />
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <Text style={styles.footerIconText}>✦</Text>
        </View>
        <Text style={styles.footerText}>
          Read-only conversation • AI chatbot
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  center: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: "#85899B",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171A2B",
  },
  errorText: {
    color: "#85899B",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 20,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF5",
  },
  backButton: {
    width: 34,
    height: 40,
    justifyContent: "center",
    marginRight: 6,
  },
  backIcon: {
    fontSize: 34,
    color: "#202236",
    lineHeight: 38,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#E9E9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4F46E5",
  },
  headerInfo: {
    flex: 1,
  },
  visitor: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202236",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#85899B",
    marginTop: 4,
  },
  headerAction: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F2F2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshIcon: {
    fontSize: 25,
    color: "#4F46E5",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    marginHorizontal: 16,
    marginTop: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEEF5",
  },
  infoTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F0F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  infoIconText: {
    fontSize: 20,
    color: "#4F46E5",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#202236",
  },
  infoSubtitle: {
    fontSize: 11,
    color: "#85899B",
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: "#F0F0FF",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4F46E5",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#ECEEF5",
    marginVertical: 14,
  },
  infoLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "800",
    color: "#969BAD",
    marginBottom: 7,
  },
  conversationId: {
    fontSize: 11,
    color: "#555B70",
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 19,
    paddingTop: 22,
    paddingBottom: 10,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#202236",
  },
  timelineCount: {
    fontSize: 11,
    color: "#85899B",
  },
  refreshError: {
    color: "#DC2626",
    fontSize: 12,
    marginHorizontal: 19,
    marginBottom: 8,
  },
  messages: {
    paddingHorizontal: 10,
    paddingBottom: 22,
    flexGrow: 1,
  },
  dateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 19,
    paddingHorizontal: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E4E6EE",
  },
  dateText: {
    color: "#969BAD",
    fontSize: 10,
    fontWeight: "700",
    marginHorizontal: 13,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#969BAD",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ECEEF5",
  },
  footerIcon: {
    marginRight: 8,
  },
  footerIconText: {
    color: "#4F46E5",
    fontSize: 16,
  },
  footerText: {
    color: "#969BAD",
    fontSize: 11,
    fontWeight: "600",
  },
});
