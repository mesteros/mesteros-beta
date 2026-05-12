"use client";

import { useEffect, useState } from "react";

type TimeEntry = {
  id: string;
  employee: string;
  date: string;
  hours: number;
  description: string;
};

type Project = {
  id: string;
  name: string;
  offerAmount: number;
  budgetHours: number;
  hourlyCost: number;
  materialCost: number;
  progress: number;
  timeEntries: TimeEntry[];
};

const defaultProject: Project = {
  id: "1",
  name: "Badeværelse Hellerup",
  offerAmount: 185000,
  budgetHours: 120,
  hourlyCost: 375,
  materialCost: 32000,
  progress: 50,
  timeEntries: [
    {
      id: "1",
      employee: "Alex",
      date: "2026-05-12",
      hours: 70,
      description: "Demo timer",
    },
  ],
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [selectedId, setSelectedId] = useState("1");

  const [newTime, setNewTime] = useState({
    employee: "",
    date: new Date().toISOString().slice(0, 10),
    hours: 0,
    description: "",
  });

  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0];

  useEffect(() => {
    const savedProjects = localStorage.getItem("mesteros-projects-v2");
    const savedSelectedId = localStorage.getItem("mesteros-selected-id-v2");

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects) as Project[];
      setProjects(parsedProjects);
      setSelectedId(savedSelectedId ?? parsedProjects[0]?.id ?? "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mesteros-projects-v2", JSON.stringify(projects));
    localStorage.setItem("mesteros-selected-id-v2", selectedId);
  }, [projects, selectedId]);

  const usedHours = selectedProject.timeEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );

  const actualCost =
    usedHours * selectedProject.hourlyCost + selectedProject.materialCost;

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

  function updateProjectField(field: keyof Project, value: string) {
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
      materialCost: 0,
      progress: 0,
      timeEntries: [],
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

  function addTimeEntry() {
    if (!newTime.employee || newTime.hours <= 0) return;

    const entry: TimeEntry = {
      id: Date.now().toString(),
      employee: newTime.employee,
      date: newTime.date,
      hours: Number(newTime.hours),
      description: newTime.description,
    };

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId
          ? {
              ...project,
              timeEntries: [...project.timeEntries, entry],
            }
          : project
      )
    );

    setNewTime({
      employee: "",
      date: new Date().toISOString().slice(0, 10),
      hours: 0,
      description: "",
    });
  }

  function deleteTimeEntry(entryId: string) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId
          ? {
              ...project,
              timeEntries: project.timeEntries.filter(
                (entry) => entry.id !== entryId
              ),
            }
          : project
      )
    );
  }

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
          gridTemplateColumns: "240px 1fr 1fr",
          gap: 24,
          maxWidth: 1400,
        }}
      >
        <Card title="Sager">
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
        </Card>

        <Card title="Rediger sag">
          {(["name", "offerAmount", "budgetHours", "hourlyCost", "materialCost", "progress"] as const).map(
            (key) => (
              <label key={key} style={{ display: "block", marginTop: 14 }}>
                <strong>{labels[key]}</strong>
                <input
                  value={selectedProject[key]}
                  onChange={(event) =>
                    updateProjectField(key, event.target.value)
                  }
                  style={inputStyle}
                />
              </label>
            )
          )}
        </Card>

        <Card title="Økonomi">
          <Metric title="Brugte timer" value={`${usedHours.toLocaleString("da-DK")} timer`} />
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
        </Card>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 1400,
          marginTop: 24,
        }}
      >
        <Card title="Registrer timer">
          <label style={labelStyle}>
            <strong>Medarbejder</strong>
            <input
              value={newTime.employee}
              onChange={(event) =>
                setNewTime({ ...newTime, employee: event.target.value })
              }
              style={inputStyle}
              placeholder="Fx Alex, Igor, Vasyl"
            />
          </label>

          <label style={labelStyle}>
            <strong>Dato</strong>
            <input
              type="date"
              value={newTime.date}
              onChange={(event) =>
                setNewTime({ ...newTime, date: event.target.value })
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <strong>Timer</strong>
            <input
              type="number"
              value={newTime.hours}
              onChange={(event) =>
                setNewTime({ ...newTime, hours: Number(event.target.value) })
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <strong>Beskrivelse</strong>
            <input
              value={newTime.description}
              onChange={(event) =>
                setNewTime({ ...newTime, description: event.target.value })
              }
              style={inputStyle}
              placeholder="Fx fliser på væg, oprydning, fugearbejde"
            />
          </label>

          <button
            onClick={addTimeEntry}
            style={{
              ...buttonStyle,
              marginTop: 18,
              background: "#111827",
              color: "white",
            }}
          >
            Gem timer
          </button>
        </Card>

        <Card title="Timeliste for valgt sag">
          {selectedProject.timeEntries.length === 0 ? (
            <p>Ingen timer registreret endnu.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedProject.timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#f4f4f5",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong>{entry.employee}</strong>
                    <p style={{ margin: "4px 0" }}>
                      {entry.date} · {entry.hours} timer
                    </p>
                    <p style={{ margin: 0, color: "#52525b" }}>
                      {entry.description || "Ingen beskrivelse"}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTimeEntry(entry.id)}
                    style={{
                      ...buttonStyle,
                      width: "auto",
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    Slet
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
      <h2>{title}</h2>
      {children}
    </div>
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

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 8,
  border: "1px solid #d4d4d8",
};

const labelStyle = {
  display: "block",
  marginTop: 14,
};

const labels: Record<string, string> = {
  name: "Sagsnavn",
  offerAmount: "Tilbudssum",
  budgetHours: "Budgettimer",
  hourlyCost: "Timekost",
  materialCost: "Materialer",
  progress: "Færdiggrad %",
};