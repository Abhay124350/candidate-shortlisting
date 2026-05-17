import axios from "axios";

const api = axios.create({
  baseURL: "https://candidate-shortlisting-8edt.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
