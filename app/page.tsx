"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔑 Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TYPES
type Project = {
  id: string;
  name: string;
  offerAmount: number;
  budgetHours: number;
  hourlyCost: number;
  progress: number;
};

// DEFAULT DATA (fallback hvis DB er tom)
const defaultProject: Project = {
  id: "1",
  name: "Badeværelse Hellerup",
  offerAmount: 185000,
  budgetHours: 120,
  hourlyCost: 375,
  progress: 50,
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);

  // 🔥 Supabase test
  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*");

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (data && data.length > 0) {
        setProjects(data);
      }
    }

    loadProjects();
  }, []);

  const project = projects[0];

  // BEREGNINGER
  const usedHours = project.progress / 100 * project.budgetHours;
  const laborCost = usedHours * project.hourlyCost;
  const totalCost = laborCost;
  const profit = project.offerAmount - totalCost;
  const margin = (profit / project.offerAmount) * 100;

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>MesterOS 🚀</h1>
      <p>Økonomistyring for håndværksmestre</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>Antal sager: {projects.length}</div>
        <div>Tilbud: {project.offerAmount.toLocaleString()} kr.</div>
        <div>Resultat: {profit.toLocaleString()} kr.</div>
        <div>Margin: {margin.toFixed(1)}%</div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>{project.name}</h2>

        <p>Brugte timer: {usedHours.toFixed(1)}</p>
        <p>Budget timer: {project.budgetHours}</p>
        <p>Timepris: {project.hourlyCost} kr</p>

        <p>Omkostning: {totalCost.toLocaleString()} kr.</p>
        <p>Fortjeneste: {profit.toLocaleString()} kr.</p>

        <div
          style={{
            marginTop: 20,
            padding: 15,
            background:
              margin > 20 ? "green" : margin > 10 ? "orange" : "red",
            color: "white",
          }}
        >
          Status: {margin > 20 ? "GRØN" : margin > 10 ? "GUL" : "RØD"}
        </div>
      </div>
    </main>
  );
}