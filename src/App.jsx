import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, setDoc, doc } from "firebase/firestore";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [steals, setSteals] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");

  // Hent nuværende bruger
  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Find rolle i Firestore
        const querySnapshot = await getDocs(collection(db, "users"));
        const userDoc = querySnapshot.docs.find(doc => doc.id === currentUser.uid);
        if (userDoc) {
          setRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setRole("");
      }
    });
  }, []);

  // Tilføj ny bruger
  const handleAddUser = async () => {
    if (!newEmail) return alert("Indtast email");

    // Lav unik ID (fx bruger email som id)
    const id = newEmail.replace(/[@.]/g, "_");

    await setDoc(doc(db, "users", id), {
      email: newEmail,
      role: newRole
    });
    alert("Bruger tilføjet!");
    setNewEmail("");
    setNewRole("user");
  };

  // Tilføj steal
  const handleAddSteal = async () => {
    await addDoc(collection(db, "steals"), {
      user: user.email,
      amount: 500,
      type: "Treasure",
      timestamp: new Date()
    });
    alert("Steal tilføjet!");
  };

  if (!user) return <Login onLogin={() => window.location.reload()} />;

  return (
    <div className="container">
      <h1>Steal Tracker</h1>
      <p>Velkommen, {user.email} ({role})</p>
      <button onClick={() => signOut(auth)}>Log ud</button>

      {role === "admin" && (
        <div style={{ marginTop: "2rem" }}>
          <h3>➕ Tilføj ny bruger (admin eller co-admin)</h3>
          <input
            type="email"
            placeholder="Bruger email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="co-admin">Co-admin</option>
            <option value="user">User</option>
          </select>
          <button onClick={handleAddUser}>Tilføj bruger</button>

          <h3>💰 Tilføj Steal</h3>
          <button onClick={handleAddSteal}>Tilføj 500 treasure</button>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3>📄 Log</h3>
        {steals.length === 0 ? <p>Ingen steals endnu.</p> : steals.map((s, i) => (
          <div key={i}>{s.user} stole {s.amount} ({s.type})</div>
        ))}
      </div>
    </div>
  );
}

export default App;
