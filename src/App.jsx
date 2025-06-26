import { useState, useEffect } from "react";
import Login from "./Login"; // ny import

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setLoggedInUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
  };

  if (!loggedInUser) {
    return <Login onLogin={setLoggedInUser} />;
  }

  return (
    <div>
      <h1>💰 Steal Tracker</h1>
      <p>Logget ind som: <strong>{loggedInUser.username}</strong> ({loggedInUser.role})</p>
      <button onClick={handleLogout}>Log ud</button>

      {/* Her kan du placere resten af din app */}
      <p>👉 Her kommer den eksisterende app-visning</p>
    </div>
  );
}

export default App;
