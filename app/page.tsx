"use client";
import { supabase } from "./lib/supabase";
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

type ProjectEconomy = {
  usedHours: number;
  materialCost: number;
  actualCost: number;
  expectedTotalCost: number;
  forecastProfit: number;
  margin: number;
  status: string;
  statusColor: string;
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

function calculateEconomy(project: Project): ProjectEconomy {
  const usedHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const materialCost = project.materialEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const actualCost = usedHours * project.hourlyCost + materialCost;

  const expectedTotalCost =
    project.progress > 0 ? actualCost / (project.progress / 100) : 0;

  const forecastProfit = project.offerAmount - expectedTotalCost;

  const margin =
    project.offerAmount > 0 ? (forecastProfit / project.offerAmount) * 100 : 0;

  const status =
    margin < 10 ? "RØD - kritisk" : margin < 25 ? "GUL - hold øje" : "GRØN - sund sag";

  const statusColor =
    margin < 10 ? "#dc2626" : margin < 25 ? "#ca8a04" : "#16a34a";

  return {
    usedHours,
    materialCost,
    actualCost,
    expectedTotalCost,
    forecastProfit,
    margin,
    status,
    statusColor,
  };
}

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
  async function testConnection() {
    const { data, error } = await supabase.from("projects").select("*");

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);
  }

  testConnection();
}, []);
  useEffect(() => {
    const savedProjects = localStorage.getItem("mesteros-projects-v4");
    const savedSelectedId = localStorage.getItem("mesteros-selected-id-v4");

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects) as Project[];
      setProjects(parsedProjects);
      setSelectedId(savedSelectedId ?? parsedProjects[0]?.id ?? "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mesteros-projects-v4", JSON.stringify(projects));
    localStorage.setItem("mesteros-selected-id-v4", selectedId);
  }, [projects, selectedId]);

  const selectedEconomy = calculateEconomy(selectedProject);

  const totalOfferAmount = projects.reduce(
    (sum, project) => sum + project.offerAmount,
    0
  );

  const totalForecastProfit = projects.reduce(
    (sum, project) => sum + calculateEconomy(project).forecastProfit,
    0
  );

  const redProjects = projects.filter(
    (project) => calculateEconomy(project).margin < 10
  ).length;

  const yellowProjects = projects.filter((project) => {
    const margin = calculateEconomy(project).margin;
    return margin >= 10 && margin < 25;
  }).length;

  const greenProjects = projects.filter(
    (project) => calculateEconomy(project).margin >= 25
  ).length;

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
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          maxWidth: 1400,
          marginBottom: 24,
        }}
      >
        <DashboardCard title="Antal sager" value={projects.length.toString()} />
        <DashboardCard
          title="Samlet tilbudssum"
          value={`${totalOfferAmount.toLocaleString("da-DK")} kr.`}
        />
        <DashboardCard
          title="Forventet resultat"
          value={`${totalForecastProfit.toLocaleString("da-DK")} kr.`}
        />
        <DashboardCard title="Røde / gule / grønne" value={`${redProjects} / ${yellowProjects} / ${greenProjects}`} />
        <DashboardCard
          title="Valgt sag margin"
          value={`${selectedEconomy.margin.toFixed(1)}%`}
        />
      </section>

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
            {projects.map((project) => {
              const economy = calculateEconomy(project);

              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  style={{
                    ...buttonStyle,
                    background:
                      project.id === selectedId ? "#111827" : "#e5e7eb",
                    color: project.id === selectedId ? "white" : "#111827",
                    textAlign: "left",
                    borderLeft: `8px solid ${economy.statusColor}`,
                  }}
                >
                  {project.name}
                </button>
              );
            })}
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
          <Metric title="Brugte timer" value={`${selectedEconomy.usedHours.toLocaleString("da-DK")} timer`} />
          <Metric title="Materialer" value={`${selectedEconomy.materialCost.toLocaleString("da-DK")} kr.`} />
          <Metric title="Faktisk forbrug" value={`${selectedEconomy.actualCost.toLocaleString("da-DK")} kr.`} />
          <Metric title="Forventet slutomkostning" value={`${selectedEconomy.expectedTotalCost.toLocaleString("da-DK")} kr.`} />
          <Metric title="Forventet resultat" value={`${selectedEconomy.forecastProfit.toLocaleString("da-DK")} kr.`} />
          <Metric title="Margin" value={`${selectedEconomy.margin.toFixed(1)}%`} />

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 12,
              background: selectedEconomy.statusColor,
              color: "white",
              fontWeight: "bold",
            }}
          >
            Status: {selectedEconomy.status}
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

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "white", padding: 18, borderRadius: 16 }}>
      <p style={{ margin: 0, color: "#52525b" }}>{title}</p>
      <h2 style={{ margin: "8px 0 0" }}>{value}</h2>
    </div>
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