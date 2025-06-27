import { useState, useEffect } from "react";
import Login from "./Login.jsx";

// Brugerdata
const users = [
  { username: "admin", password: "hemmelig", role: "admin" },
  { username: "tracker", password: "1234", role: "user" }
];

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [steals, setSteals] = useState(() => {
    const saved = localStorage.getItem("steals");
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState("");
  const [type, setType] = useState("Treasure");
  const [amount, setAmount] = useState("");

  // Gem bruger i localStorage ved login
  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setLoggedInUser(JSON.parse(stored));
  }, []);

  // Gem steals i localStorage
  useEffect(() => {
    localStorage.setItem("steals", JSON.stringify(steals));
  }, [steals]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
  };

  const handleAdd = () => {
    if (!name || !amount) return;
    const newEntry = {
      name,
      type,
      amount: parseFloat(amount),
      time: Date.now()
    };
    setSteals([...steals, newEntry]);
    setAmount("");
    setName("");
  };

  const exportToCSV = () => {
    const rows = [
      ["Navn", "Type", "Beløb", "Tidspunkt"],
      ...steals.map((s) => [
        s.name,
        s.type,
        s.amount,
        new Date(s.time).toLocaleString()
      ])
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "steal_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistik
  const total = steals.reduce((acc, s) => acc + s.amount, 0);
  const treasure = steals.filter((s) => s.type === "Treasure");
  const bottles = steals.filter((s) => s.type === "Broken Bottles");

  if (!loggedInUser) {
    return <Login onLogin={setLoggedInUser} />;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <div className="header">
        <h1>💰 Steal Tracker</h1>
      </div>

      <div className="banner">Pass or Steal!</div>
      <div className="subtext">
        Total Treasure given away so far: <span style={{ color: "#ffd700" }}>5,861,500</span>
        <br />
        (Counter updated on June 25, 2025)
      </div>

      <p>
        Logget ind som: <strong>{loggedInUser.username}</strong> ({loggedInUser.role})
      </p>
      <button onClick={handleLogout}>Log ud</button>

      <hr />

      <div style={{ marginTop: "1rem" }}>
        <input
          placeholder="Spillernavn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Treasure">Treasure</option>
          <option value="Broken Bottles">Broken Bottles</option>
        </select>
        <input
          placeholder="Beløb (f.eks. 500)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleAdd}>Tilføj</button>
      </div>

      <h3>📊 Statistik</h3>
      <ul style={{ textAlign: "left", display: "inline-block" }}>
        <li>Treasure steals: {treasure.length}</li>
        <li>Broken Bottles: {bottles.length}</li>
        <li>Total treasure stolen: {treasure.reduce((acc, s) => acc + s.amount, 0)}t</li>
        <li>Total valid steals: {steals.length}</li>
      </ul>

      {loggedInUser.role === "admin" && (
        <button onClick={exportToCSV}>📁 Eksportér som CSV</button>
      )}

      <h3>📜 Log</h3>
      <ul style={{ textAlign: "left", display: "inline-block" }}>
        {steals.map((s, i) => (
          <li key={i}>
            {s.name} stole {s.amount} ({s.type}) –{" "}
            {new Date(s.time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
