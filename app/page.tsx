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

const fallbackProject: Project = {
  id: "fallback",
  name: "Ingen sag valgt",
  offer_amount: 0,
  budget_hours: 0,
  hourly_cost: 0,
  progress: 0,
};

function money(value: number) {
  return value.toLocaleString("da-DK") + " kr.";
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (data && data.length > 0) {
        setProjects(data as Project[]);
        setSelectedId(data[0].id);
      }
    }

    loadProjects();
  }, []);

  const project =
    projects.find((item) => item.id === selectedId) ?? projects[0] ?? fallbackProject;

  const usedHours = (project.progress / 100) * project.budget_hours;
  const cost = usedHours * project.hourly_cost;
  const result = project.offer_amount - cost;
  const margin =
    project.offer_amount > 0 ? (result / project.offer_amount) * 100 : 0;

  const green = margin >= 25;
  const yellow = margin >= 10 && margin < 25;
  const status = green ? "GRØN" : yellow ? "GUL" : "RØD";

  const totalOffer = projects.reduce((sum, item) => sum + item.offer_amount, 0);

  return (
    <main style={{ padding: 40, fontFamily: "Arial", background: "#f4f4f5", minHeight: "100vh" }}>
      <h1>MesterOS 🚀</h1>
      <p>Økonomistyring for håndværksmestre</p>

      <section style={{ display: "flex", gap: 16, marginTop: 24, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div>Antal sager</div>
          <strong>{projects.length}</strong>
        </div>

        <div style={cardStyle}>
          <div>Samlet tilbudssum</div>
          <strong>{money(totalOffer)}</strong>
        </div>

        <div style={cardStyle}>
          <div>Valgt sag resultat</div>
          <strong>{money(result)}</strong>
        </div>

        <div style={cardStyle}>
          <div>Valgt sag margin</div>
          <strong>{margin.toFixed(1)}%</strong>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <aside style={panelStyle}>
          <h2>Sager</h2>

          {projects.length === 0 && <p>Ingen sager i databasen endnu.</p>}

          {projects.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                width: "100%",
                padding: 14,
                marginBottom: 10,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                background: item.id === selectedId ? "#111827" : "#e5e7eb",
                color: item.id === selectedId ? "white" : "#111827",
              }}
            >
              <strong>{item.name}</strong>
              <br />
              <small>{money(item.offer_amount)}</small>
            </button>
          ))}
        </aside>

        <section style={panelStyle}>
          <h2>{project.name}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p>Tilbudssum</p>
              <strong>{money(project.offer_amount)}</strong>
            </div>

            <div>
              <p>Færdiggrad</p>
              <strong>{project.progress}%</strong>
            </div>

            <div>
              <p>Brugte timer</p>
              <strong>{usedHours.toFixed(1)} timer</strong>
            </div>

            <div>
              <p>Budgettimer</p>
              <strong>{project.budget_hours}</strong>
            </div>

            <div>
              <p>Timekost</p>
              <strong>{money(project.hourly_cost)}</strong>
            </div>

            <div>
              <p>Omkostning</p>
              <strong>{money(cost)}</strong>
            </div>

            <div>
              <p>Forventet resultat</p>
              <strong>{money(result)}</strong>
            </div>

            <div>
              <p>Margin</p>
              <strong>{margin.toFixed(1)}%</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 12,
              background: green ? "#16a34a" : yellow ? "#f59e0b" : "#dc2626",
              color: "white",
              fontWeight: 700,
            }}
          >
            Status: {status}
          </div>
        </section>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 18,
  borderRadius: 14,
  minWidth: 180,
};

const panelStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 16,
};