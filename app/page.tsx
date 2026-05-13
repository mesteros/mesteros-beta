"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  offer_amount: number;
  budget_hours: number;
  hourly_cost: number;
  progress: number;
};

const defaultProject: Project = {
  id: "1",
  name: "Badeværelse Hellerup",
  offer_amount: 185000,
  budget_hours: 120,
  hourly_cost: 375,
  progress: 50,
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase.from("projects").select("*");

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (data && data.length > 0) {
        setProjects(data as Project[]);
      }
    }

    loadProjects();
  }, []);

  const project = projects[0] ?? defaultProject;

  const usedHours = (project.progress / 100) * project.budget_hours;
  const cost = usedHours * project.hourly_cost;
  const result = project.offer_amount - cost;
  const margin =
    project.offer_amount > 0 ? (result / project.offer_amount) * 100 : 0;

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>MesterOS 🚀</h1>
      <p>Økonomistyring for håndværksmestre</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>Antal sager: {projects.length}</div>
        <div>Tilbud: {project.offer_amount.toLocaleString("da-DK")} kr.</div>
        <div>Resultat: {result.toLocaleString("da-DK")} kr.</div>
        <div>Margin: {margin.toFixed(1)}%</div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>{project.name}</h2>

        <p>Brugte timer: {usedHours.toFixed(1)}</p>
        <p>Budget timer: {project.budget_hours}</p>
        <p>Timepris: {project.hourly_cost.toLocaleString("da-DK")} kr</p>
        <p>Omkostning: {cost.toLocaleString("da-DK")} kr.</p>
        <p>Fortjeneste: {result.toLocaleString("da-DK")} kr.</p>

        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: margin > 20 ? "green" : margin > 10 ? "orange" : "red",
            color: "white",
          }}
        >
          Status: {margin > 20 ? "GRØN" : margin > 10 ? "GUL" : "RØD"}
        </div>
      </div>
    </main>
  );
}