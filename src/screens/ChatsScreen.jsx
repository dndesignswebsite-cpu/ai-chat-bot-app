
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { getChats } from "../api/chats";
import ChatListItem from "../components/ChatListItem";

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const loadChats = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);

      const result = await getChats(1, 20);
      setChats(result.data?.chats || []);
    } catch (err) {
      console.log("Chats loading error:", err);
      setError(err.message || "Unable to load chats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    return chats.filter((chat) => {
      const lastMessage =
        chat.messages?.[chat.messages.length - 1];

      const matchesSearch =
        !query ||
        String(chat.visitorId || "").toLowerCase().includes(query) ||
        String(chat.conversationId || "").toLowerCase().includes(query) ||
        String(lastMessage?.content || "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        (filter === "Active" && !chat.endedAt);

      return matchesSearch && matchesFilter;
    });
  }, [chats, search, filter]);

  const totalMessages = chats.reduce(
    (sum, chat) => sum + (chat.messageCount || 0),
    0
  );

  const renderFilter = (label) => (
    <TouchableOpacity
      key={label}
      onPress={() => setFilter(label)}
      style={[
        styles.filterButton,
        filter === label && styles.filterButtonActive,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          filter === label && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            onPress={() =>
              navigation.navigate("ChatDetails", {
                chatId: item._id,
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadChats(true)}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredChats.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.eyebrow}>CUSTOMER SUPPORT</Text>
                <Text style={styles.title}>Conversations</Text>
                <Text style={styles.subtitle}>
                  Manage your website chats
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadChats(true)}
              >
                <Text style={styles.refreshIcon}>↻</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>◉</Text>
                </View>
                <Text style={styles.statLabel}>Conversations</Text>
                <Text style={styles.statValue}>{chats.length}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, styles.messageStatIcon]}>
                  <Text style={styles.messageStatEmoji}>✉</Text>
                </View>
                <Text style={styles.statLabel}>Total messages</Text>
                <Text style={styles.statValue}>{totalMessages}</Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search visitor, ID or message..."
                placeholderTextColor="#969BAD"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.listHeading}>
              <View>
                <Text style={styles.sectionTitle}>All conversations</Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredChats.length} conversations shown
                </Text>
              </View>
            </View>

            <View style={styles.filters}>
              {["All", "Active"].map(renderFilter)}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator size="large" color="#4F46E5" />
            ) : (
              <>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyEmoji}>✉</Text>
                </View>
                <Text style={styles.emptyTitle}>
                  {error ? "Couldn't load chats" : "No conversations found"}
                </Text>
                <Text style={styles.emptyText}>
                  {error || (search
                    ? "Try another search term."
                    : "New website conversations will appear here.")}
                </Text>
                {error ? (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => loadChats()}
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  topBar: {
    paddingTop: 22,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: "#6366F1",
    marginBottom: 7,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#171A2B",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    color: "#85899B",
    marginTop: 5,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAECF3",
  },
  refreshIcon: {
    fontSize: 28,
    color: "#4F46E5",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 19,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ECEEF5",
    marginBottom: 22,
  },
  statItem: {
    flex: 1,
    paddingHorizontal: 7,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EEEEFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  statEmoji: {
    color: "#4F46E5",
    fontSize: 19,
  },
  messageStatIcon: {
    backgroundColor: "#E6F8F0",
  },
  messageStatEmoji: {
    color: "#119B68",
    fontSize: 18,
  },
  statLabel: {
    fontSize: 11,
    color: "#85899B",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 25,
    fontWeight: "800",
    color: "#171A2B",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#ECEEF5",
    marginHorizontal: 5,
  },
  searchBox: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF3",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 26,
  },
  searchIcon: {
    fontSize: 27,
    color: "#777D92",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#171A2B",
    fontSize: 13,
    paddingVertical: 13,
  },
  clearSearch: {
    padding: 5,
    color: "#777D92",
    fontSize: 16,
  },
  listHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171A2B",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#85899B",
    marginTop: 5,
  },
  filters: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF3",
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#72778A",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 55,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 23,
    backgroundColor: "#EEEEFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyEmoji: {
    fontSize: 27,
    color: "#4F46E5",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171A2B",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#85899B",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});