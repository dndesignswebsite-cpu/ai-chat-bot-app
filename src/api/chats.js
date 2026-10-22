import { getToken } from "../storage/authStorage";

const API_BASE_URL =
  "https://dndesigns.co.in/api";

// ==========================================
// GET AUTH HEADERS
// ==========================================

const getAuthHeaders = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ==========================================
// GET ALL CHATS
// ==========================================

export const getChats = async (
  page = 1,
  limit = 20
) => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/chats?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch chats"
    );
  }

  return data;
};

// ==========================================
// GET SINGLE CHAT
// ==========================================

export const getChatById = async (chatId) => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/chats/${chatId}`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch chat"
    );
  }

  return data;
};