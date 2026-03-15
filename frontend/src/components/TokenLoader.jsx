import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUserData, setIsLoaded, loadNotifications } from "../redux/userSlice";

const TokenLoader = ({ children }) => {
  const dispatch = useDispatch();
  const isLoaded = useSelector(s => s.user.isLoaded);

  useEffect(() => {
    // Load everything synchronously from localStorage before first render
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    const notifs = localStorage.getItem("notifications");

    if (token) dispatch(setToken(token));

    if (user) {
      try { dispatch(setUserData(JSON.parse(user))); }
      catch { localStorage.removeItem("user"); }
    }

    if (notifs) {
      try { dispatch(loadNotifications(JSON.parse(notifs))); }
      catch { localStorage.removeItem("notifications"); }
    }

    dispatch(setIsLoaded(true));
  }, [dispatch]);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-primary)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return children;
};

export default TokenLoader;
