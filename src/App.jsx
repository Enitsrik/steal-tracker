// App.jsx – Komplet version med tidfelt, redigering og sletning
import { useState, useEffect } from "react";
import Login from "./Login.jsx";
import "./App.css";

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
  const [customTime, setCustomTime] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setLoggedInUser(JSON.parse(stored));
  }, []);

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
      time: customTime ? new Date(customTime).getTime() : Date.now()
    };
    setSteals([...steals, newEntry]);
    resetForm();
  };

  const handleEdit = (index) => {
    const s = steals[index];
    setName(s.name);
    setType(s.type);
    setAmount(s.amount);
    setCustomTime(new Date(s.time).toISOString().slice(0, 16));
    setEditIndex(index);
  };

  const handleSaveEdit = () => {
    const updated = [...steals];
    updated[editIndex] = {
      name,
      type,
      amount: parseFloat(amount),
      time: customTime ? new Date(customTime).getTime() : Date.now()
    };
    setSteals(updated);
    resetForm();
  };

  const handleDelete = (index) => {
    if (confirm("Er du sikker på, at du vil slette dette indlæg?")) {
      const updated = steals.filter((_, i) => i !== index);
      setSteals(updated);
      if (editIndex === index) setEditIndex(null);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setType("Treasure");
    setCustomTime("");
    setEditIndex(null);
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

  const total = steals.reduce((acc, s) => acc + s.amount, 0);
  const treasure = steals.filter((s) => s.type === "Treasure");
  const bottles = steals.filter((s) => s.type === "Broken Bottles");

  if (!loggedInUser) return <Login onLogin={setLoggedInUser} />;

  return (
    <div className="container">
      <h1>💰 Steal Tracker</h1>
      <p className="subtext">Pass or Steal!</p>
      <p className="counter">
        Total Treasure given away so far: <span className="number">5,861,500</span><br />
        <span className="date">(Counter updated on June 25, 2025)</span>
      </p>

      <p>
        Logget ind som: <strong>{loggedInUser.username}</strong> ({loggedInUser.role})
      </p>
      <button onClick={handleLogout}>Log ud</button>
      <hr />

      <div className="input-group">
        <input placeholder="Spillernavn" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Treasure">Treasure</option>
          <option value="Broken Bottles">Broken Bottles</option>
        </select>
        <input
          type="number"
          placeholder="Beløb (f.eks. 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="datetime-local"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
        />
        {editIndex !== null ? (
          <button onClick={handleSaveEdit}>Gem ændring</button>
        ) : (
          <button onClick={handleAdd}>Tilføj</button>
        )}
      </div>

      <h3>📊 Statistik</h3>
      <ul>
        <li>Treasure steals: {treasure.length}</li>
        <li>Broken Bottles: {bottles.length}</li>
        <li>Total treasure stolen: {treasure.reduce((acc, s) => acc + s.amount, 0)}t</li>
        <li>Total valid steals: {steals.length}</li>
      </ul>

      {loggedInUser.role === "admin" && (
        <button onClick={exportToCSV}>📁 Eksportér som CSV</button>
      )}

      <h3>📜 Log</h3>
      <ul>
        {steals.map((s, i) => (
          <li key={i}>
            {editIndex === i ? (
              <>
                <input value={name} onChange={(e) => setName(e.target.value)} />
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Treasure">Treasure</option>
                  <option value="Broken Bottles">Broken Bottles</option>
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
                <button onClick={handleSaveEdit}>Gem</button>
                <button onClick={() => setEditIndex(null)}>Annuller</button>
              </>
            ) : (
              <>
                {s.name} stole {s.amount} ({s.type}) – {new Date(s.time).toLocaleString()}
                <button onClick={() => handleEdit(i)}>Rediger</button>
                <button onClick={() => handleDelete(i)}>Slet</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
