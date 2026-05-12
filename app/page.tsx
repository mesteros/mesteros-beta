"use client";

import { useState } from "react";

export default function Home() {
  const [project, setProject] = useState({
    name: "Badeværelse Hellerup",
    offerAmount: 185000,
    budgetHours: 120,
    hourlyCost: 375,
    usedHours: 70,
    materialCost: 32000,
    progress: 50,
  });

  const actualCost = project.usedHours * project.hourlyCost + project.materialCost;
  const expectedTotalCost = project.progress > 0 ? actualCost / (project.progress / 100) : 0;
  const forecastProfit = project.offerAmount - expectedTotalCost;
  const margin = project.offerAmount > 0 ? (forecastProfit / project.offerAmount) * 100 : 0;

  const status =
    margin < 10 ? "RØD - kritisk" :
    margin < 25 ? "GUL - hold øje" :
    "GRØN - sund sag";

  const statusColor =
    margin < 10 ? "#dc2626" :
    margin < 25 ? "#ca8a04" :
    "#16a34a";

  function updateField(field: string, value: string) {
    setProject({
      ...project,
      [field]: field === "name" ? value : Number(value),
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f4f4f5", padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 36, marginBottom: 4 }}>MesterOS 🚀</h1>
      <p style={{ marginBottom: 30 }}>Økonomistyring for håndværksmestre</p>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 1100 }}>
        <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
          <h2>Opret / rediger sag</h2>

          {Object.entries(project).map(([key, value]) => (
            <label key={key} style={{ display: "block", marginTop: 14 }}>
              <strong>{key}</strong>
              <input
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 8,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          ))}
        </div>

        <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
          <h2>Økonomi</h2>

          <div style={{ marginTop: 16 }}>
            <p>Faktisk forbrug</p>
            <h3>{actualCost.toLocaleString("da-DK")} kr.</h3>
          </div>

          <div>
            <p>Forventet slutomkostning</p>
            <h3>{expectedTotalCost.toLocaleString("da-DK")} kr.</h3>
          </div>

          <div>
            <p>Forventet resultat</p>
            <h3>{forecastProfit.toLocaleString("da-DK")} kr.</h3>
          </div>

          <div>
            <p>Margin</p>
            <h3>{margin.toFixed(1)}%</h3>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 12,
              background: statusColor,
              color: "white",
              fontWeight: "bold",
            }}
          >
            Status: {status}
          </div>
        </div>
      </section>
    </main>
  );
}