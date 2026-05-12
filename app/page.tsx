"use client";

import { useState } from "react";

type Project = {
  name: string;
  offerAmount: number;
  budgetHours: number;
  hourlyCost: number;
  usedHours: number;
  materialCost: number;
  progress: number;
};

export default function Home() {
  const [project, setProject] = useState<Project>({
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

  const risk =
    forecastProfit < 0 ? "RØD - taber penge" :
    margin < 15 ? "GUL - lav avance" :
    "GRØN - sund sag";

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>MesterOS 🚀</h1>
      <h2>Opret sag + økonomi</h2>

      <div style={{ display: "grid", gap: 12, maxWidth: 500 }}>
        {Object.entries(project).map(([key, value]) => (
          <label key={key}>
            {key}
            <input
              style={{ display: "block", width: "100%", padding: 8 }}
              value={value}
              onChange={(e) =>
                setProject({
                  ...project,
                  [key]: key === "name" ? e.target.value : Number(e.target.value),
                })
              }
            />
          </label>
        ))}
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h2>Økonomi</h2>
      <p>Faktisk forbrug: {actualCost.toLocaleString("da-DK")} kr.</p>
      <p>Forventet slutomkostning: {expectedTotalCost.toLocaleString("da-DK")} kr.</p>
      <p>Forventet resultat: {forecastProfit.toLocaleString("da-DK")} kr.</p>
      <p>Margin: {margin.toFixed(1)}%</p>
      <h3>Status: {risk}</h3>
    </main>
  );
}