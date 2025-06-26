import { useState, useEffect } from "react";

function App() {
  const [steals, setSteals] = useState(() => {
    const saved = localStorage.getItem("steals");
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState("");
  const [type, setType] = useState("Treasure");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("steals", JSON.stringify(steals));
  }, [steals]);

  const addSteal = () => {
    const now = new Date();
    const cooldown = steals.find(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() &&
        now - new Date(s.timestamp) < 1000 * 60 * 60 * 24 &&
        !s.tooSoon
    );

    const tooSoon = Boolean(cooldown);

    if (tooSoon) {
      alert("Denne spiller har allerede stjålet inden for de sidste 24 timer!");
    }

    if (type === "Treasure" && (!amount || isNaN(amount))) {
      alert("Angiv venligst hvor meget treasure der blev stjålet.");
      return;
    }

    setSteals((prev) => [
      ...prev,
      {
        name,
        type,
        amount: type === "Treasure" ? parseInt(amount) : 0,
        timestamp: now.toISOString(),
        tooSoon,
      },
    ]);

    setName("");
    setAmount("");
  };

  const validSteals = steals.filter((s) => !s.tooSoon);
  const treasureCount = validSteals.filter((s) => s.type === "Treasure").length;
  const bottleCount = validSteals.filter((s) => s.type === "Bottle").length;
  const totalTreasure = validSteals
    .filter((s) => s.type === "Treasure")
    .reduce((sum, s) => sum + s.amount, 0);

  const exportCSV = () => {
    const header = "Name,Type,Amount,Timestamp,TooSoon\n";
    const rows = steals
      .map((s) => `${s.name},${s.type},${s.amount},${s.timestamp},${s.tooSoon}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "steals.csv";
    a.click();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>💰 Steal Tracker</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Spillernavn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        >
          <option value="Treasure">Treasure</option>
          <option value="Bottle">Broken Bottle</option>
        </select>

        {type === "Treasure" && (
          <input
            type="number"
            placeholder="Beløb (f.eks. 500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
          />
        )}

        <button onClick={addSteal} style={{ padding: "0.5rem" }}>
          Tilføj
        </button>
      </div>

      <h2>📊 Statistik</h2>
      <p>Treasure steals: {treasureCount}</p>
      <p>Broken Bottles: {bottleCount}</p>
      <p>Total treasure stolen: {totalTreasure}t</p>
      <p>Total valid steals: {validSteals.length}</p>
      <p>Steals too soon: {steals.filter((s) => s.tooSoon).length}</p>

      <button onClick={exportCSV} style={{ marginTop: "1rem", padding: "0.5rem" }}>
        📤 Eksportér som CSV
      </button>

      <h2 style={{ marginTop: "2rem" }}>📋 Log</h2>
      <ul>
        {steals.map((s, i) => (
          <li
            key={i}
            style={{ color: s.tooSoon ? "red" : "black" }}
          >
            <strong>{s.name}</strong> {s.tooSoon ? "forsøgte at stjæle" : "stjal"} en {s.type}
            {s.type === "Treasure" ? ` (${s.amount}t)` : ""} – {new Date(s.timestamp).toLocaleString()}
            {s.tooSoon && " ❌ (for tidligt!)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
