// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://annlab.pythonanywhere.com/";

export const predictDigit = async (imageData) => {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  });
  return response.json();
};
