
const API_BASE_URL = "https://dndesigns.co.in/api";

export const registerPushToken = async (token, pushToken, platform) => {
  try {
    const response = await fetch(`${API_BASE_URL}/push/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: pushToken,
        platform,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Push token registration failed"
      );
    }

    return result;
  } catch (error) {
    console.error("Push Registration Error:", error);
    throw error;
  }
};
