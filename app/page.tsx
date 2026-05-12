"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  offerAmount: number;
  budgetHours: number;
  hourlyCost: number;
  usedHours: number;
  materialCost: number;
  progress: number;
};

const defaultProject: Project = {
  id: "1",
  name: "Badeværelse Hellerup",
  offerAmount: 185000,
  budgetHours: 120,
  hourlyCost: 375,
  usedHours: 70,
  materialCost: 32000,
  progress: 50,
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [selectedId, setSelectedId] = useState("1");

  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0];

  useEffect(() => {
    const savedProjects = localStorage.getItem("mesteros-projects");
    const savedSelectedId = localStorage.getItem("mesteros-selected-id");

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects) as Project[];
      setProjects(parsedProjects);
      setSelectedId(savedSelectedId ?? parsedProjects[0]?.id ?? "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mesteros-projects", JSON.stringify(projects));
    localStorage.setItem("mesteros-selected-id", selectedId);
  }, [projects, selectedId]);

  function updateField(field: keyof Project, value: string) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId
          ? {
              ...project,
              [field]: field === "name" ? value : Number(value),
            }
          : project
      )
    );
  }

  function addProject() {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "Ny sag",
      offerAmount: 0,
      budgetHours: 0,
      hourlyCost: 375,
      usedHours: 0,
      materialCost: 0,
      progress: 0,
    };

    setProjects([...projects, newProject]);
    setSelectedId(newProject.id);
  }

  function deleteProject() {
    if (projects.length <= 1) return;

    const remainingProjects = projects.filter(
      (project) => project.id !== selectedId
    );

    setProjects(remainingProjects);
    setSelectedId(remainingProjects[0].id);
  }

  const actualCost =
    selectedProject.usedHours * selectedProject.hourlyCost +
    selectedProject.materialCost;

  const expectedTotalCost =
    selectedProject.progress > 0
      ? actualCost / (selectedProject.progress / 100)
      : 0;

  const forecastProfit = selectedProject.offerAmount - expectedTotalCost;

  const margin =
    selectedProject.offerAmount > 0
      ? (forecastProfit / selectedProject.offerAmount) * 100
      : 0;

  const status =
    margin < 10
      ? "RØD - kritisk"
      : margin < 25
      ? "GUL - hold øje"
      : "GRØN - sund sag";

  const statusColor =
    margin < 10 ? "#dc2626" : margin < 25 ? "#ca8a04" : "#16a34a";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f4f5",
        padding: 40,
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 4 }}>MesterOS 🚀</h1>
      <p style={{ marginBottom: 30 }}>Økonomistyring for håndværksmestre</p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 1fr",
          gap: 24,
          maxWidth: 1300,
        }}
      >
        <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
          <h2>Sager</h2>

          <button onClick={addProject} style={buttonStyle}>
            + Opret ny sag
          </button>

          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                style={{
                  ...buttonStyle,
                  background:
                    project.id === selectedId ? "#111827" : "#e5e7eb",
                  color: project.id === selectedId ? "white" : "#111827",
                  textAlign: "left",
                }}
              >
                {project.name}
              </button>
            ))}
          </div>

          <button
            onClick={deleteProject}
            style={{
              ...buttonStyle,
              marginTop: 16,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            Slet valgt sag
          </button>
        </div>

        <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
          <h2>Rediger sag</h2>

          {Object.entries(selectedProject)
            .filter(([key]) => key !== "id")
            .map(([key, value]) => (
              <label key={key} style={{ display: "block", marginTop: 14 }}>
                <strong>{labels[key as keyof Project]}</strong>
                <input
                  value={value}
                  onChange={(event) =>
                    updateField(key as keyof Project, event.target.value)
                  }
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

          <Metric title="Faktisk forbrug" value={`${actualCost.toLocaleString("da-DK")} kr.`} />
          <Metric title="Forventet slutomkostning" value={`${expectedTotalCost.toLocaleString("da-DK")} kr.`} />
          <Metric title="Forventet resultat" value={`${forecastProfit.toLocaleString("da-DK")} kr.`} />
          <Metric title="Margin" value={`${margin.toFixed(1)}%`} />

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

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ margin: 0, color: "#52525b" }}>{title}</p>
      <h3 style={{ marginTop: 4 }}>{value}</h3>
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

const labels: Record<string, string> = {
  name: "Sagsnavn",
  offerAmount: "Tilbudssum",
  budgetHours: "Budgettimer",
  hourlyCost: "Timekost",
  usedHours: "Brugte timer",
  materialCost: "Materialer",
  progress: "Færdiggrad %",
};