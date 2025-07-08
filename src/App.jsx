import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function App() {
  const [steals, setSteals] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Treasure");
  const [amount, setAmount] = useState("");
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    const fetchSteals = async () => {
      const q = query(collection(db, "steals"), orderBy("timestamp"));
      const data = await getDocs(q);
      setSteals(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    fetchSteals();
  }, []);

  const handleAddSteal = async () => {
    if (!name) return alert("Indtast et spillernavn!");
    if (type === "Treasure" && (!amount || isNaN(amount))) {
      alert("Angiv beløb for treasure!");
      return;
    }

    let now = new Date();
    if (customTime) {
      now = new Date(customTime);
    }

    // Justér 9 timer bagud
    const adjustedTime = new Date(now.getTime() - 9 * 60 * 60 * 1000);

    const newSteal = {
      name,
      type,
      amount: type === "Treasure" ? parseInt(amount) : 0,
      timestamp: adjustedTime.toISOString(),
    };

    const docRef = await addDoc(collection(db, "steals"), newSteal);
    setSteals((prev) => [...prev, { ...newSteal, id: docRef.id }]);

    setName("");
    setAmount("");
    setCustomTime("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "steals", id));
    setSteals((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdate = async (id, updatedSteal) => {
    await updateDoc(doc(db, "steals", id), updatedSteal);
    setSteals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedSteal } : s))
    );
  };

  const validSteals = steals.filter((s) => !s.tooSoon);
  const treasureCount = validSteals.filter((s) => s.type === "Treasure").length;
  const bottleCount = validSteals.filter((s) => s.type === "Bottle").length;
  const totalTreasure = validSteals
    .filter((s) => s.type === "Treasure")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="container">
      <h1>💰 Steal Tracker</h1>
      <p className="subtext">Pass or Steal!</p>

      <div className="input-group">
        <input
          placeholder="Spillernavn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Treasure">Treasure</option>
          <option value="Bottle">Broken Bottle</option>
        </select>
        {type === "Treasure" && (
          <input
            type="number"
            placeholder="Beløb (f.eks. 500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        )}
        <input
          type="datetime-local"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
        />
        <button onClick={handleAddSteal}>Tilføj</button>
      </div>

      <h2>📊 Statistik</h2>
      <p>Treasure steals: {treasureCount}</p>
      <p>Broken Bottles: {bottleCount}</p>
      <p>Totalt treasure stjålet: {totalTreasure}t</p>
      <p>Totalt antal gyldige steals: {validSteals.length}</p>

      <h2>📋 Log</h2>
      <ul>
        {[...steals]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> stole {s.amount} ({s.type}) –{" "}
              {new Date(s.timestamp).toLocaleString()}
              <button
                onClick={() => {
                  const newName = prompt("Nyt navn:", s.name);
                  const newAmount =
                    s.type === "Treasure"
                      ? prompt("Nyt beløb:", s.amount)
                      : 0;
                  const newTime = prompt(
                    "Ny tid (ISO format):",
                    s.timestamp
                  );
                  handleUpdate(s.id, {
                    name: newName || s.name,
                    amount: s.type === "Treasure" ? parseInt(newAmount) : 0,
                    timestamp: newTime || s.timestamp,
                  });
                }}
              >
                Rediger
              </button>
              <button onClick={() => handleDelete(s.id)}>Slet</button>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
