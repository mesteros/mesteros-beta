"use client";

import { useEffect, useState } from "react";

type TimeEntry = {
  id: string;
  employee: string;
  date: string;
  hours: number;
  description: string;
};

type MaterialEntry = {
  id: string;
  supplier: string;
  date: string;
  amount: number;
  description: string;
};

type Project = {
  id: string;
  name: string;
  offerAmount: number;
  budgetHours: number;
  hourlyCost: number;
  progress: number;
  timeEntries: TimeEntry[];
  materialEntries: MaterialEntry[];
};

const today = new Date().toISOString().slice(0, 10);

const defaultProject: Project = {
  id: "1",
  name: "Badeværelse Hellerup",
  offerAmount: 185000,
  budgetHours: 120,
  hourlyCost: 375,
  progress: 50,
  timeEntries: [
    {
      id: "1",
      employee: "Alex",
      date: today,
      hours: 70,
      description: "Demo timer",
    },
  ],
  materialEntries: [
    {
      id: "1",
      supplier: "STARK",
      date: today,
      amount: 32000,
      description: "Demo materialer",
    },
  ],
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [selectedId, setSelectedId] = useState("1");

  const [newTime, setNewTime] = useState({
    employee: "",
    date: today,
    hours: 0,
    description: "",
  });

  const [newMaterial, setNewMaterial] = useState({
    supplier: "",
    date: today,
    amount: 0,
    description: "",
  });

  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0];

  useEffect(() => {
    const savedProjects = localStorage.getItem("mesteros-projects-v3");
    const savedSelectedId = localStorage.getItem("mesteros-selected-id-v3");

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects) as Project[];
      setProjects(parsedProjects);
      setSelectedId(savedSelectedId ?? parsedProjects[0]?.id ?? "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mesteros-projects-v3", JSON.stringify(projects));
    localStorage.setItem("mesteros-selected-id-v3", selectedId);
  }, [projects, selectedId]);

  const usedHours = selectedProject.timeEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );

  const materialCost = selectedProject.materialEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  const actualCost = usedHours * selectedProject.hourlyCost + materialCost;

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
      progress: 0,
      timeEntries: [],
      materialEntries: [],
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
          ? { ...project, timeEntries: [...project.timeEntries, entry] }
          : project
      )
    );

    setNewTime({
      employee: "",
      date: today,
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

  function addMaterialEntry() {
    if (!newMaterial.supplier || newMaterial.amount <= 0) return;

    const entry: MaterialEntry = {
      id: Date.now().toString(),
      supplier: newMaterial.supplier,
      date: newMaterial.date,
      amount: Number(newMaterial.amount),
      description: newMaterial.description,
    };

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId
          ? {
              ...project,
              materialEntries: [...project.materialEntries, entry],
            }
          : project
      )
    );

    setNewMaterial({
      supplier: "",
      date: today,
      amount: 0,
      description: "",
    });
  }

  function deleteMaterialEntry(entryId: string) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId
          ? {
              ...project,
              materialEntries: project.materialEntries.filter(
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
          {(["name", "offerAmount", "budgetHours", "hourlyCost", "progress"] as const).map(
            (key) => (
              <label key={key} style={labelStyle}>
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
          <Metric title="Materialer" value={`${materialCost.toLocaleString("da-DK")} kr.`} />
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
              placeholder="Fx fliser, oprydning, fugearbejde"
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

        <Card title="Registrer materialer">
          <label style={labelStyle}>
            <strong>Leverandør</strong>
            <input
              value={newMaterial.supplier}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, supplier: event.target.value })
              }
              style={inputStyle}
              placeholder="Fx STARK, Bygma, AO"
            />
          </label>

          <label style={labelStyle}>
            <strong>Dato</strong>
            <input
              type="date"
              value={newMaterial.date}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, date: event.target.value })
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <strong>Beløb</strong>
            <input
              type="number"
              value={newMaterial.amount}
              onChange={(event) =>
                setNewMaterial({
                  ...newMaterial,
                  amount: Number(event.target.value),
                })
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <strong>Beskrivelse</strong>
            <input
              value={newMaterial.description}
              onChange={(event) =>
                setNewMaterial({
                  ...newMaterial,
                  description: event.target.value,
                })
              }
              style={inputStyle}
              placeholder="Fx fliseklæb, membran, beton"
            />
          </label>

          <button
            onClick={addMaterialEntry}
            style={{
              ...buttonStyle,
              marginTop: 18,
              background: "#111827",
              color: "white",
            }}
          >
            Gem materialer
          </button>
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
        <Card title="Timeliste for valgt sag">
          {selectedProject.timeEntries.length === 0 ? (
            <p>Ingen timer registreret endnu.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedProject.timeEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  title={entry.employee}
                  subtitle={`${entry.date} · ${entry.hours} timer`}
                  description={entry.description || "Ingen beskrivelse"}
                  onDelete={() => deleteTimeEntry(entry.id)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="Materialeliste for valgt sag">
          {selectedProject.materialEntries.length === 0 ? (
            <p>Ingen materialer registreret endnu.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedProject.materialEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  title={entry.supplier}
                  subtitle={`${entry.date} · ${entry.amount.toLocaleString("da-DK")} kr.`}
                  description={entry.description || "Ingen beskrivelse"}
                  onDelete={() => deleteMaterialEntry(entry.id)}
                />
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

function EntryCard({
  title,
  subtitle,
  description,
  onDelete,
}: {
  title: string;
  subtitle: string;
  description: string;
  onDelete: () => void;
}) {
  return (
    <div
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
        <strong>{title}</strong>
        <p style={{ margin: "4px 0" }}>{subtitle}</p>
        <p style={{ margin: 0, color: "#52525b" }}>{description}</p>
      </div>

      <button
        onClick={onDelete}
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
  progress: "Færdiggrad %",
};