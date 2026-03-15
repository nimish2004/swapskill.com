import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    token: null,
    isLoaded: false,
    notifications: [], // { id, type: "accepted"|"declined", name, skill, time }
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    logout: (state) => {
      state.userData = null;
      state.token = null;
      state.notifications = [];
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("notifications");
    },
    // isLoaded is set synchronously in TokenLoader — no flicker
    setIsLoaded: (state, action) => {
      state.isLoaded = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      // cap at 20
      if (state.notifications.length > 20) state.notifications.pop();
      localStorage.setItem("notifications", JSON.stringify(state.notifications));
    },
    markNotificationsRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(state.notifications));
    },
    loadNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      localStorage.removeItem("notifications");
    },
  },
});

export const {
  setUserData, setToken, logout, setIsLoaded,
  addNotification, markNotificationsRead, loadNotifications, clearNotifications,
} = userSlice.actions;

export default userSlice.reducer;
