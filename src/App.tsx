import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Page =
  | "dashboard"
  | "missions"
  | "create"
  | "created"
  | "detail"
  | "analysis"
  | "alert"
  | "alertReview"
  | "decision"
  | "maintenance"
  | "maintenanceTicket"
  | "reports";
type Mission = {
  id: string;
  uav: string;
  operator: string;
  type: string;
  name: string;
  area: string;
  start: string;
  status: string;
  risk: string;
  ai: string;
  updated: string;
};
type AlertItem = {
  id: string;
  mission: string;
  uav: string;
  type: string;
  issue: string;
  risk: string;
  status: string;
  role: string;
  time: string;
  confidence: string;
  recommendation: string;
};
type Ticket = {
  id: string;
  mission: string;
  uav: string;
  alert: string;
  issue: string;
  priority: string;
  tech: string;
  status: string;
  due: string;
};
type AnomalyLog = {
  record: string;
  mission: string;
  uav: string;
  model: string;
  cluster: string;
  score: string;
  risk: string;
  decision: string;
  maintenance: string;
  status: string;
  date: string;
};

const seedMissions: Mission[] = [
  {
    id: "M-1001",
    uav: "UAV-07",
    operator: "Alex Morgan",
    type: "Surveillance",
    name: "North Perimeter Scan",
    area: "Sector N-4",
    start: "08:15",
    status: "Abnormal",
    risk: "Critical",
    ai: "DBSCAN: Outlier",
    updated: "2 min ago",
  },
  {
    id: "M-1002",
    uav: "UAV-03",
    operator: "Jamie Tran",
    type: "Inspection",
    name: "Solar Array Inspection",
    area: "Energy Campus",
    start: "09:40",
    status: "Normal",
    risk: "Low",
    ai: "K-Means: C1",
    updated: "8 min ago",
  },
  {
    id: "M-1003",
    uav: "UAV-11",
    operator: "Sam Rivera",
    type: "Delivery",
    name: "Medical Supply Transfer",
    area: "Campus East",
    start: "10:05",
    status: "Under Review",
    risk: "High",
    ai: "DBSCAN: Outlier",
    updated: "4 min ago",
  },
];
const seedAlerts: AlertItem[] = [
  {
    id: "ALT-8821",
    mission: "M-1001",
    uav: "UAV-07",
    type: "Collision Risk",
    issue: "Low LiDAR distance and abnormal IMU vibration",
    risk: "Critical",
    status: "Under Review",
    role: "Safety Officer",
    time: "10:21",
    confidence: "96.8%",
    recommendation: "Emergency Landing",
  },
  {
    id: "ALT-8818",
    mission: "M-1003",
    uav: "UAV-11",
    type: "Flight Instability",
    issue: "Abnormal gyroscope movement",
    risk: "High",
    status: "New",
    role: "UAV Operator",
    time: "10:08",
    confidence: "91.4%",
    recommendation: "Return-to-Home",
  },
  {
    id: "ALT-8809",
    mission: "M-0994",
    uav: "UAV-02",
    type: "Battery",
    issue: "Battery level below safety threshold",
    risk: "Medium",
    status: "In Progress",
    role: "Maintenance Team",
    time: "09:42",
    confidence: "88.2%",
    recommendation: "Continue Monitoring",
  },
];
const seedTickets: Ticket[] = [
  {
    id: "MT-2048",
    mission: "M-1001",
    uav: "UAV-07",
    alert: "ALT-8821",
    issue: "LiDAR / IMU",
    priority: "Critical",
    tech: "Jordan Lee",
    status: "In Progress",
    due: "2026-07-21",
  },
  {
    id: "MT-2042",
    mission: "M-0994",
    uav: "UAV-02",
    alert: "ALT-8809",
    issue: "Battery",
    priority: "High",
    tech: "Minh Pham",
    status: "Waiting Parts",
    due: "2026-07-22",
  },
];
const seedLogs: AnomalyLog[] = [
  {
    record: "LOG-5412",
    mission: "M-1001",
    uav: "UAV-07",
    model: "DBSCAN",
    cluster: "-1",
    score: "0.94",
    risk: "Critical",
    decision: "Emergency Landing",
    maintenance: "Yes",
    status: "Closed",
    date: "2026-07-11",
  },
  {
    record: "LOG-5408",
    mission: "M-0994",
    uav: "UAV-02",
    model: "K-Means",
    cluster: "C3",
    score: "0.72",
    risk: "High",
    decision: "Return-to-Home",
    maintenance: "Yes",
    status: "Closed",
    date: "2026-07-10",
  },
  {
    record: "LOG-5396",
    mission: "M-0981",
    uav: "UAV-05",
    model: "DBSCAN",
    cluster: "-1",
    score: "0.68",
    risk: "Medium",
    decision: "False Alarm",
    maintenance: "No",
    status: "False Alarm",
    date: "2026-07-09",
  },
];
const telemetry = [
  [
    "10:21:04",
    "10.7621",
    "106.6822",
    "118 m",
    "68%",
    "5.8 m",
    "12.4 m/s",
    "Normal",
  ],
  [
    "10:21:14",
    "10.7625",
    "106.6828",
    "121 m",
    "66%",
    "4.2 m",
    "13.1 m/s",
    "Normal",
  ],
  [
    "10:21:24",
    "10.7629",
    "106.6834",
    "119 m",
    "63%",
    "0.7 m",
    "10.8 m/s",
    "Warning",
  ],
];
const navItems: [Page, string, string][] = [
  ["dashboard", "Dashboard", "▦"],
  ["missions", "Flight Missions", "✈"],
  ["create", "Create Flight", "＋"],
  ["analysis", "AI Analysis", "⌁"],
  ["alert", "Alerts", "!"],
  ["maintenance", "Maintenance", "◇"],
  ["reports", "Report & Anomaly Logs", "≡"],
];

const routeToHash = (page: Page, missionId = "M-1001") => {
  const routes: Record<Page, string> = {
    dashboard: "/",
    missions: "/missions",
    create: "/missions/new",
    created: `/missions/${missionId}/created`,
    detail: `/missions/${missionId}`,
    analysis: `/missions/${missionId}/analysis`,
    alert: "/alerts",
    alertReview: `/alerts/${missionId}`,
    decision: `/alerts/${missionId}/decision`,
    maintenance: "/maintenance",
    maintenanceTicket: `/maintenance/${missionId}`,
    reports: "/reports",
  };
  return `#${routes[page]}`;
};

const routeFromHash = (): { page: Page; missionId?: string } => {
  const path = window.location.hash.slice(1) || "/";
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return { page: "dashboard" };
  if (parts[0] === "missions") {
    if (parts[1] === "new") return { page: "create" };
    if (!parts[1]) return { page: "missions" };
    if (parts[2] === "created")
      return { page: "created", missionId: parts[1] };
    if (parts[2] === "analysis")
      return { page: "analysis", missionId: parts[1] };
    return { page: "detail", missionId: parts[1] };
  }
  if (parts[0] === "alerts") {
    if (!parts[1]) return { page: "alert" };
    return {
      page: parts[2] === "decision" ? "decision" : "alertReview",
      missionId: parts[1],
    };
  }
  if (parts[0] === "maintenance")
    return parts[1]
      ? { page: "maintenanceTicket", missionId: parts[1] }
      : { page: "maintenance" };
  if (parts[0] === "reports") return { page: "reports" };
  return { page: "dashboard" };
};

const scenarioFromMission = (mission?: Mission): "Normal" | "Abnormal" =>
  mission &&
  (mission.status === "Normal" ||
    mission.ai.includes("K-Means") ||
    (mission.risk === "Low" && !mission.ai.includes("DBSCAN")))
    ? "Normal"
    : "Abnormal";

const riskClass = (v: string) =>
  `badge ${["Critical", "Abnormal", "Emergency"].includes(v) ? "red" : ["High", "Medium", "Warning", "Under Review", "Analyzing", "In Progress", "Pending Approval", "Waiting Parts"].includes(v) ? "amber" : ["Low", "Normal", "Safe", "Completed", "Available", "Approved", "Safety Action Executed", "Closed"].includes(v) ? "green" : "gray"}`;

function Badge({ children }: { children: string }) {
  return <span className={riskClass(children)}>{children}</span>;
}
function Button({
  children,
  onClick,
  kind = "primary",
  disabled = false,
}: {
  children: string;
  onClick?: () => void;
  kind?: string;
  disabled?: boolean;
}) {
  return (
    <button className={`btn ${kind}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </section>
  );
}
function PageHead({
  title,
  eyebrow,
  actions,
}: {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow || "OPERATIONS CENTER"}</span>
        <h1>{title}</h1>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children}
    </label>
  );
}
function Metric({
  label,
  value,
  meta,
  tone = "blue",
}: {
  label: string;
  value: string;
  meta?: string;
  tone?: string;
}) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <i></i>
      </div>
      <strong>{value}</strong>
      {meta && <small>{meta}</small>}
    </div>
  );
}
function Chart({
  title,
  type = "line",
  danger = false,
}: {
  title: string;
  type?: string;
  danger?: boolean;
}) {
  return (
    <Card className="chart">
      <div className="chart-head">
        <b>{title}</b>
        <span>Last 7 days</span>
      </div>
      <div className={`chart-art ${type} ${danger ? "danger" : ""}`}>
        <div className="grid-lines" />
        <div className="bars">
          {[42, 63, 48, 78, 56, 88, 66].map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </Card>
  );
}
function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function EmptyState({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <i>⌕</i>
      <b>{title}</b>
      <span>Try changing or clearing the current filters.</span>
      <Button kind="secondary" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}

function App() {
  const initialRoute = useMemo(routeFromHash, []);
  const [page, setPage] = useState<Page>(initialRoute.page),
    [missions, setMissions] = useState(seedMissions),
    [selectedId, setSelectedId] = useState(
      initialRoute.missionId || "M-1001",
    );
  const [alerts, setAlerts] = useState(seedAlerts),
    [tickets, setTickets] = useState(seedTickets),
    [logs, setLogs] = useState(seedLogs);
  const [scenario, setScenario] = useState<"Normal" | "Abnormal">("Abnormal"),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState<{
      title: string;
      body: string;
      action: () => void;
    } | null>(null);
  const [decision, setDecision] = useState({
    choice: "Emergency Landing",
    note: "Abnormal vibration requires immediate safety response.",
    assign: "Safety Officer",
    nextStatus: "Pending Approval",
    approved: false,
  });
  const [ticketStatus, setTicketStatus] = useState("Open"),
    [detailTab, setDetailTab] = useState("Overview");
  const selected = missions.find((m) => m.id === selectedId) || missions[0];
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(
        { page: initialRoute.page, missionId: initialRoute.missionId },
        "",
        routeToHash(initialRoute.page, initialRoute.missionId),
      );
    }
    const handleHistoryNavigation = () => {
      const route = routeFromHash();
      setPage(route.page);
      if (route.missionId) setSelectedId(route.missionId);
      if (route.page === "analysis") {
        setScenario(
          scenarioFromMission(
            missions.find((mission) => mission.id === route.missionId),
          ),
        );
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, [initialRoute, missions]);
  useEffect(() => {
    const pageTitles: Record<Page, string> = {
      dashboard: "Dashboard",
      missions: "Flight Missions",
      create: "Create Flight",
      created: "Mission Created",
      detail: "Flight Detail",
      analysis: "AI Analysis",
      alert: "Alerts",
      alertReview: "Alert Review",
      decision: "Decision Recorded",
      maintenance: "Maintenance",
      maintenanceTicket: "Maintenance Ticket",
      reports: "Report & Anomaly Logs",
    };
    document.title = `${pageTitles[page]} · FlightInsight`;
  }, [page]);
  const go = (p: Page, id?: string) => {
    const missionId = id || selectedId;
    if (id) setSelectedId(missionId);
    if (p === "analysis") {
      setScenario(
        scenarioFromMission(
          missions.find((mission) => mission.id === missionId),
        ),
      );
    }
    setPage(p);
    window.history.pushState(
      { page: p, missionId },
      "",
      routeToHash(p, missionId),
    );
    window.scrollTo(0, 0);
  };
  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };
  const updateMission = (patch: Partial<Mission>) =>
    setMissions((ms) =>
      ms.map((m) => (m.id === selected.id ? { ...m, ...patch } : m)),
    );
  const createMission = (data: Record<string, string>, analyze = false) => {
    const m: Mission = {
      id: `M-${1001 + missions.length}`,
      uav: data.uav,
      operator: data.operator,
      type: data.type,
      name: data.name,
      area: data.area || "Not specified",
      start: data.start || "Scheduled",
      status: analyze ? "Analyzing" : "New",
      risk: "Pending",
      ai: "Pending",
      updated: "Just now",
    };
    setMissions((x) => [m, ...x]);
    if (analyze) setScenario("Abnormal");
    go(analyze ? "analysis" : "created", m.id);
  };
  const createAlert = (mission: Mission) => {
    const existing = alerts.find(
      (a) =>
        a.mission === mission.id &&
        a.status !== "Closed" &&
        a.status !== "False Alarm",
    );
    if (existing) return existing;
    const alert: AlertItem = {
      id: `ALT-${8822 + alerts.length}`,
      mission: mission.id,
      uav: mission.uav,
      type: "Flight Instability",
      issue: "Low LiDAR distance and abnormal IMU vibration",
      risk: "Critical",
      status: "Under Review",
      role: "Safety Officer",
      time: "Just now",
      confidence: "96.8%",
      recommendation: "Emergency Landing",
    };
    setAlerts((x) => [alert, ...x]);
    return alert;
  };
  const storeLog = (mission: Mission, patch: Partial<AnomalyLog>) =>
    setLogs((current) => {
      const base: AnomalyLog = {
        record: `LOG-${5413 + current.length}`,
        mission: mission.id,
        uav: mission.uav,
        model: scenario === "Abnormal" ? "DBSCAN" : "K-Means",
        cluster: scenario === "Abnormal" ? "-1" : "C1",
        score: scenario === "Abnormal" ? "0.94" : "0.12",
        risk: scenario === "Abnormal" ? "Critical" : "Low",
        decision:
          scenario === "Abnormal" ? "Pending Review" : "Continue Monitoring",
        maintenance: "No",
        status: scenario === "Abnormal" ? "Open" : "Closed",
        date: "2026-07-19",
      };
      const next = { ...base, ...patch };
      return [next, ...current.filter((l) => l.mission !== mission.id)];
    });
  const createTicket = (mission: Mission) => {
    const existing = tickets.find(
      (t) => t.mission === mission.id && t.status !== "Completed",
    );
    if (existing) return existing;
    const alert = alerts.find((a) => a.mission === mission.id);
    const ticket: Ticket = {
      id: `MT-${2049 + tickets.length}`,
      mission: mission.id,
      uav: mission.uav,
      alert: alert?.id || "Pending",
      issue: "LiDAR / IMU",
      priority: mission.risk === "Critical" ? "Critical" : "High",
      tech: "Jordan Lee",
      status: "Open",
      due: "2026-07-22",
    };
    setTickets((x) => [ticket, ...x]);
    setMissions((ms) =>
      ms.map((m) =>
        m.id === mission.id
          ? { ...m, status: "In Maintenance", updated: "Just now" }
          : m,
      ),
    );
    storeLog(mission, {
      decision: "Maintenance Required",
      maintenance: "Yes",
      status: "Open",
    });
    return ticket;
  };
  return (
    <div className="app-shell">
      <aside>
        <div className="brand">
          <div className="brand-mark">FI</div>
          <div>
            <b>FlightInsight</b>
            <span>UAV MONITORING</span>
          </div>
        </div>
        <nav>
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              className={
                page === id ||
                (id === "missions" && ["created", "detail"].includes(page)) ||
                (id === "alert" && page === "alertReview") ||
                (id === "maintenance" && page === "maintenanceTicket")
                  ? "active"
                  : ""
              }
              onClick={() => go(id)}
            >
              <i>{icon}</i>
              {label}
              {id === "alert" && (
                <em>
                  {
                    alerts.filter(
                      (a) =>
                        !["Closed", "False Alarm", "Completed"].includes(
                          a.status,
                        ),
                    ).length
                  }
                </em>
              )}
            </button>
          ))}
        </nav>
        <div className="system-card">
          <span className="pulse" />
          <div>
            <b>System operational</b>
            <small>All services online</small>
          </div>
        </div>
        <div className="side-user">
          <div>FM</div>
          <span>
            <b>Fleet Manager</b>
            <small>Operations Admin</small>
          </span>
          <button>⋮</button>
        </div>
      </aside>
      <div className="workspace">
        <main>{renderPage()}</main>
      </div>
      {toast && (
        <div className="toast">
          <b>✓</b>
          {toast}
        </div>
      )}
      {modal && (
        <div className="modal-back">
          <div className="modal">
            <div className="modal-icon">!</div>
            <h2>{modal.title}</h2>
            <p>{modal.body}</p>
            <div className="actions">
              <Button kind="secondary" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  modal.action();
                  setModal(null);
                }}
              >
                Confirm action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderPage() {
    if (page === "dashboard")
      return (
        <Dashboard
          missions={missions}
          alerts={alerts}
          tickets={tickets}
          go={go}
        />
      );
    if (page === "missions") return <Missions missions={missions} go={go} />;
    if (page === "create")
      return <CreateFlight go={go} onCreate={createMission} notify={notify} />;
    if (page === "created") return <Created m={selected} go={go} />;
    if (page === "detail")
      return (
        <Detail
          m={selected}
          tab={detailTab}
          setTab={setDetailTab}
          go={go}
          update={updateMission}
          createTicket={createTicket}
          storeLog={storeLog}
        />
      );
    if (page === "analysis")
      return (
        <Analysis
          m={selected}
          scenario={scenario}
          setScenario={setScenario}
          go={go}
          update={updateMission}
          confirm={setModal}
          createAlert={createAlert}
          createTicket={createTicket}
          storeLog={storeLog}
        />
      );
    if (page === "alert") return <AlertsList alerts={alerts} go={go} />;
    if (page === "alertReview")
      return (
        <Alert
          m={selected}
          alert={alerts.find((a) => a.mission === selected.id)}
          decision={decision}
          setDecision={setDecision}
          go={go}
          confirm={setModal}
          update={updateMission}
          updateAlerts={setAlerts}
          createTicket={createTicket}
          storeLog={storeLog}
        />
      );
    if (page === "decision")
      return (
        <DecisionRecorded
          m={selected}
          decision={decision}
          setDecision={setDecision}
          go={go}
          update={updateMission}
          updateAlerts={setAlerts}
          createTicket={createTicket}
          storeLog={storeLog}
        />
      );
    if (page === "maintenance")
      return <MaintenanceList tickets={tickets} go={go} />;
    if (page === "maintenanceTicket")
      return (
        <Maintenance
          m={selected}
          ticket={tickets.find((t) => t.mission === selected.id)}
          status={ticketStatus}
          setStatus={setTicketStatus}
          go={go}
          notify={notify}
          update={updateMission}
          updateTickets={setTickets}
          createTicket={createTicket}
          storeLog={storeLog}
        />
      );
    return <Reports missions={missions} logs={logs} notify={notify} />;
  }
}

function Dashboard({
  missions,
  alerts,
  tickets,
  go,
}: {
  missions: Mission[];
  alerts: AlertItem[];
  tickets: Ticket[];
  go: (p: Page, id?: string) => void;
}) {
  const active = missions.filter(
      (m) => !["Completed", "False Alarm"].includes(m.status),
    ),
    normal = missions.filter((m) => m.status === "Normal"),
    abnormal = alerts.filter(
      (a) => !["Closed", "False Alarm", "Completed"].includes(a.status),
    ),
    critical = abnormal.filter((a) => a.risk === "Critical"),
    openTickets = tickets.filter((t) => t.status !== "Completed");
  const workflow = [
    "New",
    "Analyzing",
    "Anomaly Detected",
    "Under Review",
    "Pending Approval",
    "Approved",
    "In Maintenance",
    "Completed",
    "False Alarm",
  ].map((status) => [
    status,
    String(missions.filter((m) => m.status === status).length),
  ]);
  return (
    <>
      <PageHead
        title="Fleet Operations Overview"
        eyebrow="REAL-TIME BPMN WORKFLOW"
        actions={
          <>
            <Button kind="secondary" onClick={() => go("reports")}>
              View reports
            </Button>
            <Button onClick={() => go("create")}>+ Create flight</Button>
          </>
        }
      />
      <div className="metrics-grid">
        <Metric
          label="Active UAVs"
          value={String(new Set(active.map((m) => m.uav)).size)}
          meta={`${active.length} active missions`}
        />
        <Metric
          label="Missions Today"
          value={String(missions.length)}
          meta="Live prototype state"
        />
        <Metric
          label="Normal Flights"
          value={String(normal.length)}
          meta="Automatically closed cases"
          tone="green"
        />
        <Metric
          label="Abnormal Alerts"
          value={String(abnormal.length)}
          meta={`${abnormal.filter((a) => a.status === "Under Review").length} require review`}
          tone="amber"
        />
        <Metric
          label="Critical Alerts"
          value={String(critical.length)}
          meta="Immediate action"
          tone="red"
        />
        <Metric
          label="Open Maintenance"
          value={String(openTickets.length)}
          meta={`${openTickets.filter((t) => t.priority === "Critical").length} critical priority`}
          tone="amber"
        />
        <Metric
          label="Avg. Response Time"
          value="4m 12s"
          meta="Mock workflow metric"
          tone="green"
        />
      </div>
      <Card title="Live workflow">
        <div className="workflow">
          {workflow.map((x, i) => (
            <div key={x[0]}>
              <span>{x[1]}</span>
              <b>{x[0]}</b>
              {i < workflow.length - 1 && <i>›</i>}
            </div>
          ))}
        </div>
      </Card>
      <div className="split">
        <Card title="Recent Alerts">
          {alerts.length ? (
            <Table
              headers={[
                "Alert ID",
                "Mission",
                "UAV",
                "Risk",
                "Status",
                "Assigned to",
                "",
              ]}
              rows={alerts.slice(0, 4).map((a) => [
                <b>{a.id}</b>,
                a.mission,
                a.uav,
                <Badge>{a.risk}</Badge>,
                <Badge>{a.status}</Badge>,
                a.role,
                <button
                  className="link"
                  onClick={() => go("alertReview", a.mission)}
                >
                  Review →
                </button>,
              ])}
            />
          ) : (
            <EmptyState
              title="No anomaly alerts"
              action="View missions"
              onAction={() => go("missions")}
            />
          )}
        </Card>
        <Card title="Active Flights">
          {active.length ? (
            <Table
              headers={["Mission", "UAV", "Operator", "Status", "Start", ""]}
              rows={active.slice(0, 4).map((m) => [
                <b>{m.id}</b>,
                m.uav,
                m.operator,
                <Badge>{m.status}</Badge>,
                m.start,
                <button className="link" onClick={() => go("detail", m.id)}>
                  Detail →
                </button>,
              ])}
            />
          ) : (
            <EmptyState
              title="No active flights"
              action="Create flight"
              onAction={() => go("create")}
            />
          )}
        </Card>
      </div>
      <div className="chart-grid">
        <Chart title="Anomaly Trend by Day" />
        <Chart title="Common Anomaly Types" type="bar" />
        <Chart title="Flight Status Distribution" type="donut" />
      </div>
    </>
  );
}

function Missions({
  missions,
  go,
}: {
  missions: Mission[];
  go: (p: Page, id?: string) => void;
}) {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [risk, setRisk] = useState("All risk levels"),
    [type, setType] = useState("All mission types");
  const rows = useMemo(
    () =>
      missions.filter(
        (m) =>
          (status === "All statuses" || m.status === status) &&
          (risk === "All risk levels" || m.risk === risk) &&
          (type === "All mission types" || m.type === type) &&
          [m.id, m.uav, m.operator]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [q, status, risk, type, missions],
  );
  return (
    <>
      <PageHead
        title="Flight Missions"
        actions={<Button onClick={() => go("create")}>+ Create Flight</Button>}
      />
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search Mission ID, UAV ID, Operator..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All statuses</option>
          <option>Normal</option>
          <option>Abnormal</option>
          <option>Under Review</option>
          <option>New</option>
          <option>Analyzing</option>
        </select>
        <select
          aria-label="Filter by risk level"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option>All risk levels</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
          <option>Pending</option>
        </select>
        <select
          aria-label="Filter by mission type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>All mission types</option>
          <option>Surveillance</option>
          <option>Inspection</option>
          <option>Delivery</option>
          <option>Test Flight</option>
        </select>
        <button
          className="clear-filter"
          onClick={() => {
            setQ("");
            setStatus("All statuses");
            setRisk("All risk levels");
            setType("All mission types");
          }}
        >
          Reset
        </button>
      </div>
      <Card>
        {rows.length ? (
          <Table
            headers={[
              "Mission ID",
              "UAV ID",
              "Operator",
              "Mission Type",
              "Start Time",
              "Status",
              "Risk",
              "AI Result",
              "Last Updated",
              "Actions",
            ]}
            rows={rows.map((m) => [
              <b>{m.id}</b>,
              m.uav,
              m.operator,
              m.type,
              m.start,
              <Badge>{m.status}</Badge>,
              <Badge>{m.risk}</Badge>,
              m.ai,
              m.updated,
              <div className="row-actions">
                <button className="link" onClick={() => go("detail", m.id)}>
                  View detail
                </button>
                <button className="mini" onClick={() => go("analysis", m.id)}>
                  Run AI
                </button>
              </div>,
            ])}
          />
        ) : (
          <EmptyState
            title="No missions match these filters"
            action="Reset filters"
            onAction={() => {
              setQ("");
              setStatus("All statuses");
              setRisk("All risk levels");
              setType("All mission types");
            }}
          />
        )}
        <div className="table-footer">
          Showing {rows.length} of {missions.length} missions{" "}
          <span>
            ‹ <b>1</b> ›
          </span>
        </div>
      </Card>
    </>
  );
}

function CreateFlight({
  go,
  onCreate,
  notify,
}: {
  go: (p: Page) => void;
  onCreate: (d: Record<string, string>, a?: boolean) => void;
  notify: (s: string) => void;
}) {
  const [f, setF] = useState({
      name: "",
      type: "",
      area: "",
      description: "",
      start: "",
      duration: "45 minutes",
      priority: "Medium",
      uav: "",
      model: "",
      battery: "",
      operator: "",
      contact: "",
      uavStatus: "Available",
    }),
    [err, setErr] = useState(""),
    [stream, setStream] = useState(true);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  const submit = (ai = false) => {
    if (!f.name || !f.type || !f.uav || !f.operator) {
      setErr("Complete Mission Name, Mission Type, UAV ID, and Operator Name.");
      return;
    }
    onCreate(f, ai);
  };
  return (
    <>
      <PageHead title="Create New Flight Mission" eyebrow="MISSION SETUP" />
      <div className="form-grid">
        <Card title="1. Mission Information">
          <div className="fields">
            <Field label="Mission ID">
              <input value="Auto-generated on creation" disabled />
            </Field>
            <Field label="Mission Name" required>
              <input
                value={f.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. North perimeter inspection"
              />
            </Field>
            <Field label="Mission Type" required>
              <select
                value={f.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">Select type</option>
                {["Surveillance", "Delivery", "Inspection", "Test Flight"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Flight Area / Route">
              <input
                value={f.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Sector or route"
              />
            </Field>
            <Field label="Start Time">
              <input
                type="datetime-local"
                value={f.start}
                onChange={(e) => set("start", e.target.value)}
              />
            </Field>
            <Field label="Expected Duration">
              <input
                value={f.duration}
                onChange={(e) => set("duration", e.target.value)}
              />
            </Field>
            <Field label="Priority">
              <select
                value={f.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {["Low", "Medium", "High"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Mission Description">
              <textarea
                value={f.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Mission objectives and operational notes"
              />
            </Field>
          </div>
        </Card>
        <Card title="2. UAV Information">
          <div className="fields">
            <Field label="UAV ID" required>
              <select
                value={f.uav}
                onChange={(e) => set("uav", e.target.value)}
              >
                <option value="">Select UAV</option>
                {["UAV-01", "UAV-03", "UAV-07", "UAV-11"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="UAV Model">
              <input
                value={f.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="AeroScout X4"
              />
            </Field>
            <Field label="Battery Level">
              <input
                value={f.battery}
                onChange={(e) => set("battery", e.target.value)}
                placeholder="e.g. 96%"
              />
            </Field>
            <Field label="Operator Name" required>
              <input
                value={f.operator}
                onChange={(e) => set("operator", e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field label="Operator Contact">
              <input
                value={f.contact}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="Phone or radio channel"
              />
            </Field>
            <Field label="Current UAV Status">
              <select
                value={f.uavStatus}
                onChange={(e) => set("uavStatus", e.target.value)}
              >
                {["Available", "In Mission", "In Maintenance"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
        </Card>
        <Card title="3. Telemetry Input">
          <Toggle
            label="Real-time Telemetry Stream"
            value={stream}
            set={setStream}
          />
          <div className="upload">
            <b>Upload flight log</b>
            <span>CSV / JSON flight log supported, up to 10 MB</span>
            <Button
              kind="secondary"
              onClick={() => notify("Mock flight log attached successfully.")}
            >
              Choose file
            </Button>
          </div>
          <div className="info-box">
            <b>Telemetry fields monitored</b>
            <p>
              GPS latitude & longitude · altitude · IMU acceleration X/Y/Z · IMU
              gyroscope X/Y/Z · LiDAR distance · speed · wind speed · battery
              level
            </p>
          </div>
        </Card>
        <Card title="4. Safety Configuration">
          <div className="fields three">
            <Field label="Min. Battery Threshold">
              <input defaultValue="20%" />
            </Field>
            <Field label="Min. LiDAR Distance">
              <input defaultValue="1.5 m" />
            </Field>
            <Field label="Max. Wind Speed">
              <input defaultValue="15 m/s" />
            </Field>
          </div>
          <Toggle label="Enable Auto Alert" value={true} />
          <Toggle label="Safety Officer Escalation" value={true} />
        </Card>
      </div>
      {err && <div className="validation">! {err}</div>}
      <div className="form-footer">
        <Button kind="ghost" onClick={() => go("missions")}>
          Cancel
        </Button>
        <span />
        <Button
          kind="secondary"
          onClick={() => notify("Draft saved successfully.")}
        >
          Save as Draft
        </Button>
        <Button kind="secondary" onClick={() => submit(false)}>
          Create Mission
        </Button>
        <Button onClick={() => submit(true)}>Create & Start AI Analysis</Button>
      </div>
    </>
  );
}

function Toggle({
  label,
  value = false,
  set,
}: {
  label: string;
  value?: boolean;
  set?: (v: boolean) => void;
}) {
  const [local, setLocal] = useState(value);
  const v = set ? value : local;
  return (
    <button
      type="button"
      className="toggle-row"
      onClick={() => (set ? set(!v) : setLocal(!v))}
    >
      <span>
        <b>{label}</b>
        <small>{v ? "Enabled" : "Disabled"}</small>
      </span>
      <i className={v ? "on" : ""}>
        <em />
      </i>
    </button>
  );
}

function Created({ m, go }: { m: Mission; go: (p: Page) => void }) {
  return (
    <div className="confirmation">
      <div className="success-icon">✓</div>
      <span className="eyebrow">MISSION CREATED</span>
      <h1>Flight mission created successfully.</h1>
      <p>The mission is ready for telemetry collection and AI analysis.</p>
      <Card title="Mission summary">
        <div className="summary-grid">
          {[
            ["Mission ID", m.id],
            ["Mission Name", m.name],
            ["UAV ID", m.uav],
            ["Operator", m.operator],
            ["Mission Type", m.type],
            ["Flight Area / Route", m.area],
            ["Start Time", m.start],
            ["Telemetry Mode", "Real-time stream"],
            ["Current Status", m.status],
          ].map((x) => (
            <div key={String(x[0])}>
              <span>{x[0]}</span>
              <b>{x[0] === "Current Status" ? <Badge>{x[1]}</Badge> : x[1]}</b>
            </div>
          ))}
        </div>
      </Card>
      <div className="actions centered">
        <Button kind="secondary" onClick={() => go("detail")}>
          View Flight Detail
        </Button>
        <Button onClick={() => go("analysis")}>Start AI Analysis</Button>
        <Button kind="ghost" onClick={() => go("missions")}>
          Go to Flight Missions
        </Button>
        <Button kind="ghost" onClick={() => go("dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

function Detail({
  m,
  tab,
  setTab,
  go,
  update,
  createTicket,
  storeLog,
}: {
  m: Mission;
  tab: string;
  setTab: (s: string) => void;
  go: (p: Page) => void;
  update: (p: Partial<Mission>) => void;
  createTicket: (m: Mission) => Ticket;
  storeLog: (m: Mission, p: Partial<AnomalyLog>) => void;
}) {
  const tabs = [
    "Overview",
    "Telemetry",
    "AI Result",
    "Alerts & Decisions",
    "Maintenance",
    "Activity Log",
  ];
  return (
    <>
      <PageHead
        title={`Flight Detail: ${m.id}`}
        eyebrow="MISSION CONTROL"
        actions={
          <>
            <Button kind="secondary" onClick={() => go("analysis")}>
              Run AI Analysis
            </Button>
            <Button onClick={() => go("alertReview")}>Send to Review</Button>
          </>
        }
      />
      <Card>
        <div className="detail-summary">
          {[
            ["Mission", m.id],
            ["UAV", m.uav],
            ["Type", m.type],
            ["Operator", m.operator],
            ["Status", <Badge>{m.status}</Badge>],
            ["Risk", <Badge>{m.risk}</Badge>],
            ["AI Result", m.ai],
            ["Last Updated", m.updated],
          ].map((x) => (
            <div key={String(x[0])}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </Card>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={t === tab ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="split equal">
          <Card title="Mission information">
            <div className="summary-list">
              {[
                ["Mission name", m.name],
                ["Flight area", m.area],
                ["Mission type", m.type],
                ["Operator", m.operator],
                ["Start time", m.start],
                ["Telemetry mode", "Real-time stream"],
              ].map((x) => (
                <p key={String(x[0])}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </p>
              ))}
            </div>
          </Card>
          <Card title="Workflow timeline">
            <div className="timeline">
            {[
              "New",
              "Analyzing",
              "Analysis Completed",
              "Anomaly Detected",
              "Under Review",
              "Pending Approval",
              "Approved",
              "Safety Action Executed",
              "In Maintenance",
              "Completed",
            ].map((x, i) => (
                <div key={x} className={i < 4 ? "done" : ""}>
                  <i>{i < 4 ? "✓" : i + 1}</i>
                  <span>
                    <b>{x}</b>
                    <small>{i < 4 ? "Step completed" : "Pending"}</small>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      {tab === "Telemetry" && (
        <>
          <div className="chart-grid">
            <Chart title="Battery Level over Time" />
            <Chart title="LiDAR Distance over Time" danger />
            <Chart title="Speed over Time" />
            <Chart title="IMU Acceleration Trend" />
            <Chart title="Wind Speed Trend" />
          </div>
          <Card title="Telemetry samples">
            <Table
              headers={[
                "Timestamp",
                "Latitude",
                "Longitude",
                "Altitude",
                "Battery",
                "LiDAR",
                "Speed",
                "Status",
              ]}
              rows={telemetry.map((r) =>
                r.map((x, i) => (i === 7 ? <Badge>{x}</Badge> : x)),
              )}
            />
          </Card>
        </>
      )}
      {tab === "AI Result" && (
        <AnalysisSummary
          abnormal={m.ai.includes("DBSCAN") || m.risk === "Critical"}
        />
      )}{" "}
      {tab === "Alerts & Decisions" && (
        <>
          <Card title="Alert list">
            <Table
              headers={[
                "Alert ID",
                "Detected issue",
                "Risk",
                "Status",
                "Assigned to",
                "Time",
                "",
              ]}
              rows={[
                [
                  <b>ALT-8821</b>,
                  "Low LiDAR distance and IMU vibration",
                  <Badge>Critical</Badge>,
                  <Badge>Under Review</Badge>,
                  "Safety Officer",
                  "10:21",
                  <button className="link" onClick={() => go("alertReview")}>
                    Review →
                  </button>,
                ],
              ]}
            />
          </Card>
          <Card title="Decision history">
            <Table
              headers={["Decision", "Decision Maker", "Time", "Notes"]}
              rows={[
                [
                  m.status === "Completed" ? "Completed" : "Emergency Landing",
                  "Safety Officer",
                  "10:28",
                  "Safety-first response recorded.",
                ],
              ]}
            />
          </Card>
        </>
      )}
      {tab === "Maintenance" && (
        <Card title="Maintenance ticket summary">
          <Table
            headers={[
              "Ticket ID",
              "UAV",
              "Issue Type",
              "Priority",
              "Technician",
              "Status",
            ]}
            rows={[
              [
                <b>MT-2048</b>,
                m.uav,
                "LiDAR / IMU",
                <Badge>Critical</Badge>,
                "Jordan Lee",
                <Badge>In Progress</Badge>,
              ],
            ]}
          />
        </Card>
      )}
      {tab === "Activity Log" && (
        <Card title="Mission activity">
          <div className="activity">
            {[
              "Mission created",
              "Telemetry received",
              "AI analysis completed",
              "Alert generated",
              "Decision recorded",
              "Maintenance ticket created",
              "Case closed",
            ].map((x, i) => (
              <div key={x} className={i < 5 ? "done" : ""}>
                <i></i>
                <span>
                  <b>{x}</b>
                  <small>
                    {i < 5 ? `11 Jul 2026 · 10:${10 + i * 3}` : "Pending"}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="sticky-actions">
        <Button
          kind="secondary"
          onClick={() => {
            createTicket(m);
            go("maintenanceTicket");
          }}
        >
          Create Maintenance Ticket
        </Button>
        <Button
          onClick={() => {
            update({ status: "Completed", risk: "Low", updated: "Just now" });
            storeLog(m, { decision: "Case Closed", status: "Closed" });
          }}
        >
          Mark as Completed
        </Button>
      </div>
    </>
  );
}

function AnalysisSummary({ abnormal }: { abnormal: boolean }) {
  return (
    <Card title="AI Result">
      <div className="summary-grid">
        {[
          ["Model Used", abnormal ? "DBSCAN" : "K-Means"],
          ["Cluster Label", abnormal ? "Outlier (-1)" : "Cluster C1"],
          ["Anomaly Score", abnormal ? "0.94" : "0.12"],
          ["Confidence Score", abnormal ? "96.8%" : "94.2%"],
          [
            "Risk Level",
            abnormal ? <Badge>Critical</Badge> : <Badge>Low</Badge>,
          ],
          [
            "Recommended Action",
            abnormal ? "Emergency Landing" : "Continue Monitoring",
          ],
        ].map((x) => (
          <div>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Analysis({
  m,
  scenario,
  setScenario,
  go,
  update,
  confirm,
  createAlert,
  createTicket,
  storeLog,
}: {
  m: Mission;
  scenario: string;
  setScenario: (s: "Normal" | "Abnormal") => void;
  go: (p: Page) => void;
  update: (p: Partial<Mission>) => void;
  confirm: (x: any) => void;
  createAlert: (m: Mission) => AlertItem;
  createTicket: (m: Mission) => Ticket;
  storeLog: (m: Mission, p: Partial<AnomalyLog>) => void;
}) {
  const abnormal = scenario === "Abnormal";
  useEffect(() => {
    if (abnormal) {
      createAlert(m);
      update({
        status: "Anomaly Detected",
        risk: "Critical",
        ai: "DBSCAN: Outlier",
        updated: "Just now",
      });
      storeLog(m, {
        decision: "Pending Review",
        maintenance: "No",
        status: "Open",
      });
    } else {
      update({
        status: "Normal",
        risk: "Low",
        ai: "K-Means: C1",
        updated: "Just now",
      });
      storeLog(m, {
        decision: "Continue Monitoring",
        maintenance: "No",
        status: "Closed",
      });
    }
    // Scenario selection represents completion of the mock clustering task.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.id, scenario]);
  const features = [
    "battery_level",
    "lidar_distance",
    "speed",
    "wind_speed",
    "altitude",
    "imu_acc_x",
    "imu_acc_y",
    "imu_acc_z",
    "imu_gyro_x",
    "imu_gyro_y",
    "imu_gyro_z",
  ];
  return (
    <>
      <PageHead
        title="AI Telemetry Analysis"
        eyebrow="ANALYSIS COMPLETED"
        actions={
          <Field label="Select AI Scenario">
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as any)}
            >
              <option>Normal</option>
              <option>Abnormal</option>
            </select>
          </Field>
        }
      />
      <Card>
        <div className="detail-summary">
          <div>
            <span>Mission ID</span>
            <b>{m.id}</b>
          </div>
          <div>
            <span>UAV ID</span>
            <b>{m.uav}</b>
          </div>
          <div>
            <span>Mission Type</span>
            <b>{m.type}</b>
          </div>
          <div>
            <span>Operator</span>
            <b>{m.operator}</b>
          </div>
          <div>
            <span>Analysis Status</span>
            <b>
              <Badge>Completed</Badge>
            </b>
          </div>
          <div>
            <span>Model Used</span>
            <b>{abnormal ? "DBSCAN" : "K-Means"}</b>
          </div>
          <div>
            <span>Last Updated</span>
            <b>Just now</b>
          </div>
        </div>
      </Card>
      <div className={`analysis-banner ${abnormal ? "critical" : "safe"}`}>
        <b>{abnormal ? "!" : "✓"}</b>
        <span>
          <strong>
            {abnormal
              ? "Abnormal flight behavior detected."
              : "Flight behavior is normal."}
          </strong>
          <small>
            {abnormal
              ? "Operator review is required. Low LiDAR distance and abnormal IMU vibration detected."
              : "No immediate action required. Continue standard monitoring."}
          </small>
        </span>
      </div>
      <div className="result-grid">
        <Metric
          label="Overall Flight Status"
          value={scenario}
          tone={abnormal ? "red" : "green"}
        />
        <Metric
          label="Cluster Label"
          value={abnormal ? "Outlier (-1)" : "Cluster C1"}
        />
        <Metric
          label="Anomaly Score"
          value={abnormal ? "0.94" : "0.12"}
          tone={abnormal ? "red" : "green"}
        />
        <Metric label="Confidence Score" value={abnormal ? "96.8%" : "94.2%"} />
        <Metric
          label="Risk Level"
          value={abnormal ? "Critical" : "Low"}
          tone={abnormal ? "red" : "green"}
        />
        <Metric
          label="Recommended Action"
          value={abnormal ? "Emergency Landing" : "Continue Monitoring"}
          tone={abnormal ? "red" : "green"}
        />
      </div>
      <div className="chart-grid">
        <Chart title="Battery Level over Time" />
        <Chart title="LiDAR Distance over Time" danger={abnormal} />
        <Chart title="Speed over Time" />
        <Chart title="IMU Vibration / Acceleration" danger={abnormal} />
        <Chart title="Wind Speed Trend" />
      </div>
      <Card title="Feature Status">
        <Table
          headers={[
            "Feature Name",
            "Current Value",
            "Normal Range",
            "Status",
            "Notes",
          ]}
          rows={features.map((f, i) => {
            const warn = abnormal && [1, 5, 6].includes(i);
            return [
              <code>{f}</code>,
              warn
                ? i === 1
                  ? "0.7 m"
                  : "2.84 m/s²"
                : ["63%", "5.8 m", "10.8 m/s", "8.2 m/s", "119 m", "0.18 m/s²"][
                    i
                  ] || "0.11°/s",
              i === 1 ? "> 1.5 m" : "Within baseline",
              <Badge>{warn ? "Warning" : "Normal"}</Badge>,
              warn ? "Outside safety threshold" : "Expected behavior",
            ];
          })}
        />
      </Card>
      <Card title="Model Explanation">
        <p className="explain">
          K-Means and DBSCAN group UAV flight behavior into clusters. The system
          uses cluster labels and anomaly scores as decision-support data for
          the UAV safety workflow.
        </p>
      </Card>
      <div className="form-footer">
        <Button kind="ghost" onClick={() => go("missions")}>
          Back to Flight Missions
        </Button>
        <span />
        <Button kind="secondary" onClick={() => go("detail")}>
          View Flight Detail
        </Button>
        <Button
          kind="secondary"
          onClick={() => {
            createTicket(m);
            go("maintenanceTicket");
          }}
        >
          Create Maintenance Ticket
        </Button>
        <Button
          kind="secondary"
          onClick={() =>
            confirm({
              title: "Mark flight as Normal?",
              body: "Are you sure you want to mark this flight as Normal?",
              action: () => {
                update({
                  status: "Normal",
                  risk: "Low",
                  ai: "K-Means: C1",
                  updated: "Just now",
                });
                storeLog(m, {
                  decision: "Continue Monitoring",
                  maintenance: "No",
                  status: "Closed",
                });
                go("detail");
              },
            })
          }
        >
          Mark as Normal
        </Button>
        <Button
          disabled={!abnormal}
          onClick={() => {
            createAlert(m);
            update({
              status: "Under Review",
              risk: "Critical",
              ai: "DBSCAN: Outlier",
              updated: "Just now",
            });
            storeLog(m, {
              decision: "Pending Review",
              maintenance: "No",
              status: "Open",
            });
            go("alertReview");
          }}
        >
          Send to Review
        </Button>
      </div>
    </>
  );
}

function AlertsList({
  alerts,
  go,
}: {
  alerts: AlertItem[];
  go: (p: Page, id?: string) => void;
}) {
  const data = alerts;
  const [q, setQ] = useState(""),
    [risk, setRisk] = useState("All risks"),
    [type, setType] = useState("All types"),
    [status, setStatus] = useState("All statuses");
  const rows = data.filter(
    (a) =>
      (risk === "All risks" || a.risk === risk) &&
      (type === "All types" || a.type === type) &&
      (status === "All statuses" || a.status === status) &&
      [a.id, a.mission, a.uav, a.issue]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead title="Alerts" eyebrow="ANOMALY RESPONSE QUEUE" />
      <div className="metrics-grid five">
        <Metric
          label="Open Alerts"
          value="3"
          meta="Requires action"
          tone="amber"
        />
        <Metric
          label="Critical"
          value="1"
          meta="Immediate response"
          tone="red"
        />
        <Metric
          label="Under Review"
          value="1"
          meta="Assigned to safety"
          tone="amber"
        />
        <Metric
          label="Resolved Today"
          value="7"
          meta="Average 4m 12s"
          tone="green"
        />
        <Metric label="False Alarms" value="2" meta="This week" />
      </div>
      <div className="toolbar">
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search alert, mission, UAV, or issue..."
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter alert type"
        >
          <option>All types</option>
          {[
            "Collision Risk",
            "Flight Instability",
            "Battery",
            "Weather",
            "GPS Signal",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          aria-label="Filter alert risk"
        >
          <option>All risks</option>
          {["Critical", "High", "Medium", "Low"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter alert status"
        >
          <option>All statuses</option>
          {[
            "New",
            "Under Review",
            "In Progress",
            "Completed",
            "False Alarm",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button
          className="clear-filter"
          onClick={() => {
            setQ("");
            setType("All types");
            setRisk("All risks");
            setStatus("All statuses");
          }}
        >
          Reset
        </button>
      </div>
      <Card>
        {rows.length ? (
          <Table
            headers={[
              "Alert ID",
              "Mission",
              "UAV",
              "Alert Type",
              "Detected Issue",
              "Risk",
              "Status",
              "Assigned To",
              "Detected",
              "Action",
            ]}
            rows={rows.map((a) => [
              <b>{a.id}</b>,
              a.mission,
              a.uav,
              a.type,
              a.issue,
              <Badge>{a.risk}</Badge>,
              <Badge>{a.status}</Badge>,
              a.role,
              a.time,
              <button
                className="mini"
                onClick={() => go("alertReview", a.mission)}
              >
                Review alert
              </button>,
            ])}
          />
        ) : (
          <EmptyState
            title="No alerts match these filters"
            action="Reset filters"
            onAction={() => {
              setQ("");
              setType("All types");
              setRisk("All risks");
              setStatus("All statuses");
            }}
          />
        )}
      </Card>
    </>
  );
}

function Alert({
  m,
  alert,
  decision,
  setDecision,
  go,
  confirm,
  update,
  updateAlerts,
  createTicket,
  storeLog,
}: {
  m: Mission;
  alert?: AlertItem;
  decision: any;
  setDecision: (x: any) => void;
  go: (p: Page) => void;
  confirm: (x: any) => void;
  update: (p: Partial<Mission>) => void;
  updateAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  createTicket: (m: Mission) => Ticket;
  storeLog: (m: Mission, p: Partial<AnomalyLog>) => void;
}) {
  const activeAlert = alert || {
    id: "ALT-PENDING",
    mission: m.id,
    uav: m.uav,
    type: "Flight Instability",
    issue: "Low LiDAR distance and abnormal IMU vibration",
    risk: "Critical",
    status: "Under Review",
    role: "Safety Officer",
    time: "Just now",
    confidence: "96.8%",
    recommendation: "Emergency Landing",
  };
  const updateAlert = (patch: Partial<AlertItem>) =>
    updateAlerts((items) =>
      items.map((a) => (a.id === activeAlert.id ? { ...a, ...patch } : a)),
    );
  const decide = (choice: string) => {
    if (choice === "Create Maintenance Ticket") {
      createTicket(m);
      updateAlert({ status: "In Progress", role: "Maintenance Team" });
      setDecision({
        ...decision,
        choice,
        nextStatus: "In Maintenance",
        approved: true,
      });
      go("decision");
      return;
    }
    if (choice === "Mark as False Alarm") {
      update({ status: "False Alarm", risk: "Low", updated: "Just now" });
      updateAlert({ status: "False Alarm" });
      storeLog(m, {
        decision: "False Alarm",
        maintenance: "No",
        status: "False Alarm",
      });
      setDecision({
        ...decision,
        choice,
        nextStatus: "False Alarm",
        approved: false,
      });
      go("decision");
      return;
    }
    if (choice === "Continue Monitoring") {
      update({
        status: "Rejected / Postponed",
        risk: "Medium",
        updated: "Just now",
      });
      updateAlert({ status: "Rejected / Postponed" });
      storeLog(m, {
        decision: "Continue Monitoring",
        maintenance: "No",
        status: "Open",
      });
      setDecision({
        ...decision,
        choice,
        nextStatus: "Rejected / Postponed",
        approved: false,
      });
      go("decision");
      return;
    }
    update({ status: "Pending Approval", updated: "Just now" });
    updateAlert({
      status: "Pending Approval",
      role: "Fleet Manager / Safety Officer",
    });
    setDecision({
      ...decision,
      choice,
      nextStatus: "Pending Approval",
      approved: false,
    });
    go("decision");
  };
  const ask = (choice: string) =>
    confirm({
      title: `Submit ${choice} for approval?`,
      body: `The Fleet Manager or Safety Officer must approve this safety action for ${m.id} before the UAV Operator can execute it.`,
      action: () => decide(choice),
    });
  return (
    <>
      <PageHead
        title="Alert Review & Decision"
        eyebrow={`${activeAlert.risk.toUpperCase()} ALERT · ${activeAlert.id}`}
      />
      <div className="alert-layout">
        <div>
          <Card title="Alert details">
            <div className="summary-grid">
              {[
                ["Alert ID", activeAlert.id],
                ["Mission ID", m.id],
                ["UAV ID", m.uav],
                ["Risk Level", <Badge>{activeAlert.risk}</Badge>],
                ["Detected Issue", activeAlert.issue],
                ["AI Result", m.ai],
                ["Confidence Score", activeAlert.confidence],
                ["Time Detected", activeAlert.time],
                ["Assigned Role", activeAlert.role],
              ].map((x, i) => (
                <div key={i}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Route preview">
            <div className="map">
              <span>{m.uav}</span>
              <i />
              <b>Restricted proximity detected</b>
            </div>
          </Card>
        </div>
        <div>
          <Card title="AI recommendation">
            <div className="recommend">
              <Badge>{activeAlert.risk}</Badge>
              <h2>{activeAlert.recommendation}</h2>
              <p>
                LiDAR clearance dropped below the configured threshold while
                high-frequency IMU vibration indicated possible sensor or motor
                instability.
              </p>
              <div>
                <b>Related telemetry</b>
                <span>lidar_distance · imu_acc_x · imu_acc_y</span>
              </div>
            </div>
          </Card>
          <Card title="Record decision">
            <div className="decision-form">
              <Field label="Decision">
                <select
                  value={decision.choice}
                  onChange={(e) =>
                    setDecision({ ...decision, choice: e.target.value })
                  }
                >
                  {[
                    "Continue Monitoring",
                    "Return-to-Home",
                    "Emergency Landing",
                    "Create Maintenance Ticket",
                    "Mark as False Alarm",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Decision Note">
                <textarea
                  value={decision.note}
                  onChange={(e) =>
                    setDecision({ ...decision, note: e.target.value })
                  }
                />
              </Field>
              <Field label="Assign To">
                <select
                  value={decision.assign}
                  onChange={(e) =>
                    setDecision({ ...decision, assign: e.target.value })
                  }
                >
                  {[
                    "UAV Operator",
                    "Safety Officer",
                    "Maintenance Team",
                    "Fleet Manager",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Button onClick={() => decide(decision.choice)}>
                Confirm Decision
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <div className="action-strip">
        <span>
          <b>Immediate actions</b>
          <small>High-risk commands require approval before execution</small>
        </span>
        <Button kind="ghost" onClick={() => go("alert")}>
          Back to Alerts
        </Button>
        <Button kind="secondary" onClick={() => ask("Return-to-Home")}>
          Return-to-Home
        </Button>
        <Button kind="danger" onClick={() => ask("Emergency Landing")}>
          Emergency Landing
        </Button>
        <Button
          kind="secondary"
          onClick={() => decide("Create Maintenance Ticket")}
        >
          Create Maintenance Ticket
        </Button>
        <Button kind="ghost" onClick={() => decide("Mark as False Alarm")}>
          Mark as False Alarm
        </Button>
      </div>
    </>
  );
}

function DecisionRecorded({
  m,
  decision,
  setDecision,
  go,
  update,
  updateAlerts,
  createTicket,
  storeLog,
}: {
  m: Mission;
  decision: any;
  setDecision: (x: any) => void;
  go: (p: Page) => void;
  update: (p: Partial<Mission>) => void;
  updateAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  createTicket: (m: Mission) => Ticket;
  storeLog: (m: Mission, p: Partial<AnomalyLog>) => void;
}) {
  const updateRelatedAlert = (patch: Partial<AlertItem>) =>
    updateAlerts((items) =>
      items.map((a) =>
        a.mission === m.id && !["Closed", "False Alarm"].includes(a.status)
          ? { ...a, ...patch }
          : a,
      ),
    );
  const approve = () => {
    update({ status: "Approved", updated: "Just now" });
    updateRelatedAlert({ status: "Approved", role: "UAV Operator" });
    setDecision({ ...decision, nextStatus: "Approved", approved: true });
  };
  const execute = () => {
    update({ status: "Safety Action Executed", updated: "Just now" });
    updateRelatedAlert({ status: "Closed" });
    storeLog(m, {
      decision: decision.choice,
      maintenance: "No",
      status: "Closed",
    });
    setDecision({
      ...decision,
      nextStatus: "Safety Action Executed",
      approved: true,
    });
  };
  return (
    <div className="confirmation">
      <div className="success-icon">✓</div>
      <span className="eyebrow">WORKFLOW UPDATED</span>
      <h1>Decision recorded successfully.</h1>
      <p>
        {decision.nextStatus === "Pending Approval"
          ? "The safety action is waiting for Fleet Manager or Safety Officer approval."
          : "All assigned roles have been notified of the next action."}
      </p>
      <Card title="Decision summary">
        <div className="summary-grid">
          {[
            ["Mission ID", m.id],
            ["Alert ID", `Alert for ${m.id}`],
            ["Decision", decision.choice],
            ["Decision Maker", "Fleet Manager / Safety Officer"],
            ["Assigned To", decision.assign],
            ["Next Status", <Badge>{decision.nextStatus}</Badge>],
            ["Notes", decision.note],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </Card>
      <div className="actions centered">
        {decision.nextStatus === "Pending Approval" && (
          <Button onClick={approve}>Approve Safety Action</Button>
        )}
        {decision.nextStatus === "Approved" && (
          <Button onClick={execute}>Execute Approved Action</Button>
        )}
        <Button kind="secondary" onClick={() => go("detail")}>
          View Flight Detail
        </Button>
        <Button
          kind="secondary"
          onClick={() => {
            createTicket(m);
            go("maintenanceTicket");
          }}
        >
          Create Maintenance Ticket
        </Button>
        <Button kind="ghost" onClick={() => go("alert")}>
          View Alerts
        </Button>
        <Button kind="ghost" onClick={() => go("dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
function MaintenanceList({
  tickets,
  go,
}: {
  tickets: Ticket[];
  go: (p: Page, id?: string) => void;
}) {
  const data = tickets;
  const [q, setQ] = useState(""),
    [priority, setPriority] = useState("All priorities"),
    [status, setStatus] = useState("All statuses"),
    [issue, setIssue] = useState("All issue types");
  const rows = data.filter(
    (t) =>
      (priority === "All priorities" || t.priority === priority) &&
      (status === "All statuses" || t.status === status) &&
      (issue === "All issue types" || t.issue.includes(issue)) &&
      [t.id, t.mission, t.uav, t.tech]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        title="Maintenance"
        eyebrow="FLEET SERVICE QUEUE"
        actions={
          <Button onClick={() => go("maintenanceTicket", "M-1001")}>
            + Create Ticket
          </Button>
        }
      />
      <div className="metrics-grid five">
        <Metric
          label="Open Tickets"
          value="3"
          meta="Across 3 UAVs"
          tone="amber"
        />
        <Metric
          label="Critical Priority"
          value="1"
          meta="Immediate service"
          tone="red"
        />
        <Metric label="In Progress" value="1" meta="Technician assigned" />
        <Metric
          label="Waiting Parts"
          value="1"
          meta="ETA 14 July"
          tone="amber"
        />
        <Metric
          label="Completed This Month"
          value="14"
          meta="92% on schedule"
          tone="green"
        />
      </div>
      <div className="toolbar">
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticket, mission, UAV, or technician..."
        />
        <select
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          aria-label="Filter issue type"
        >
          <option>All issue types</option>
          {["Battery", "Motor", "Sensor", "GPS", "LiDAR", "IMU"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Filter priority"
        >
          <option>All priorities</option>
          {["Critical", "High", "Medium", "Low"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter maintenance status"
        >
          <option>All statuses</option>
          {["Open", "In Progress", "Waiting Parts", "Completed"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button
          className="clear-filter"
          onClick={() => {
            setQ("");
            setIssue("All issue types");
            setPriority("All priorities");
            setStatus("All statuses");
          }}
        >
          Reset
        </button>
      </div>
      <Card>
        {rows.length ? (
          <Table
            headers={[
              "Ticket ID",
              "Mission",
              "UAV",
              "Related Alert",
              "Issue Type",
              "Priority",
              "Technician",
              "Status",
              "Due Date",
              "Action",
            ]}
            rows={rows.map((t) => [
              <b>{t.id}</b>,
              t.mission,
              t.uav,
              t.alert,
              t.issue,
              <Badge>{t.priority}</Badge>,
              t.tech,
              <Badge>{t.status}</Badge>,
              t.due,
              <button
                className="mini"
                onClick={() => go("maintenanceTicket", t.mission)}
              >
                View ticket
              </button>,
            ])}
          />
        ) : (
          <EmptyState
            title="No maintenance tickets match"
            action="Reset filters"
            onAction={() => {
              setQ("");
              setIssue("All issue types");
              setPriority("All priorities");
              setStatus("All statuses");
            }}
          />
        )}
      </Card>
    </>
  );
}

function Maintenance({
  m,
  ticket,
  status,
  setStatus,
  go,
  notify,
  update,
  updateTickets,
  createTicket,
  storeLog,
}: {
  m: Mission;
  ticket?: Ticket;
  status: string;
  setStatus: (s: string) => void;
  go: (p: Page) => void;
  notify: (s: string) => void;
  update: (p: Partial<Mission>) => void;
  updateTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  createTicket: (m: Mission) => Ticket;
  storeLog: (m: Mission, p: Partial<AnomalyLog>) => void;
}) {
  const [checks, setChecks] = useState([true, false, true, false, true, false]);
  const [currentStatus, setCurrentStatus] = useState(ticket?.status || status);
  const active = ticket || {
    id: "Pending",
    mission: m.id,
    uav: m.uav,
    alert: "Pending",
    issue: "LiDAR / IMU",
    priority: m.risk === "Critical" ? "Critical" : "High",
    tech: "Jordan Lee",
    status: currentStatus,
    due: "2026-07-22",
  };
  const save = (nextStatus = currentStatus) => {
    updateTickets((items) =>
      items.map((t) => (t.id === active.id ? { ...t, status: nextStatus } : t)),
    );
    setCurrentStatus(nextStatus);
    setStatus(nextStatus);
    notify("Maintenance update saved successfully.");
  };
  const complete = () => {
    save("Completed");
    update({ status: "Completed", risk: "Low", updated: "Just now" });
    storeLog(m, {
      decision: "Maintenance Completed",
      maintenance: "Yes",
      status: "Closed",
    });
    notify("Maintenance completed and monitoring case closed.");
  };
  return (
    <>
      <PageHead
        title="Maintenance Ticket"
        eyebrow={`TICKET ${active.id}`}
        actions={<Badge>{currentStatus}</Badge>}
      />
      <Card title="Ticket details">
        <div className="detail-summary">
          {[
            ["Ticket ID", active.id],
            ["Mission ID", m.id],
            ["UAV ID", m.uav],
            ["Related Alert", active.alert],
            ["Issue Type", active.issue],
            ["Priority", <Badge>{active.priority}</Badge>],
            ["Technician", active.tech],
            ["Status", <Badge>{currentStatus}</Badge>],
            ["Due Date", active.due],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </Card>
      <div className="split equal">
        <Card title="Maintenance information">
          <div className="fields">
            <Field label="Issue Type">
              <select
                defaultValue={
                  active.issue.includes("LiDAR") ? "LiDAR" : active.issue
                }
              >
                <option>LiDAR</option>
                {["Battery", "Motor", "Sensor", "GPS", "IMU", "Unknown"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Priority">
              <select defaultValue={active.priority}>
                {["Low", "Medium", "High", "Critical"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned Technician">
              <input defaultValue={active.tech} />
            </Field>
            <Field label="Expected Completion Date">
              <input type="date" defaultValue={active.due} />
            </Field>
            <Field label="Maintenance Notes">
              <textarea defaultValue="Inspect LiDAR clearance sensor and investigate abnormal IMU vibration before test flight." />
            </Field>
            <Field label="Update Status">
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
              >
                {["Open", "In Progress", "Waiting Parts", "Completed"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
          </div>
        </Card>
        <Card title="Repair checklist">
          <div className="checklist">
            {[
              "Inspect battery",
              "Inspect motor",
              "Inspect sensors",
              "Check GPS signal",
              "Check LiDAR sensor",
              "Test flight readiness",
            ].map((x, i) => (
              <label key={x}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() =>
                    setChecks((c) => c.map((v, j) => (i === j ? !v : v)))
                  }
                />
                <span>
                  <b>{x}</b>
                  <small>
                    {checks[i] ? "Inspection complete" : "Pending inspection"}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <div className="check-progress">
            <span>Checklist progress</span>
            <b>{checks.filter(Boolean).length} / 6 complete</b>
          </div>
        </Card>
      </div>
      <div className="form-footer">
        <Button kind="ghost" onClick={() => go("maintenance")}>
          Back to Maintenance
        </Button>
        <Button kind="secondary" onClick={() => go("detail")}>
          View Related Flight
        </Button>
        <span />
        <Button
          kind="secondary"
          onClick={() => {
            createTicket(m);
            notify("Maintenance ticket created successfully.");
          }}
        >
          Create Ticket
        </Button>
        <Button kind="secondary" onClick={() => save(currentStatus)}>
          Save Update
        </Button>
        <Button onClick={complete}>Mark as Completed</Button>
      </div>
    </>
  );
}
function Reports({
  missions,
  logs,
  notify,
}: {
  missions: Mission[];
  logs: AnomalyLog[];
  notify: (s: string) => void;
}) {
  const [from, setFrom] = useState("2026-07-01"),
    [uav, setUav] = useState("All UAVs"),
    [mission, setMission] = useState(""),
    [risk, setRisk] = useState("All Risk Levels"),
    [model, setModel] = useState("All AI Models"),
    [status, setStatus] = useState("All Statuses");
  const rows = logs.filter(
    (r) =>
      (!from || r.date >= from) &&
      (uav === "All UAVs" || r.uav === uav) &&
      r.mission.toLowerCase().includes(mission.toLowerCase()) &&
      (risk === "All Risk Levels" || r.risk === risk) &&
      (model === "All AI Models" || r.model === model) &&
      (status === "All Statuses" || r.status === status),
  );
  const reset = () => {
    setFrom("2026-07-01");
    setUav("All UAVs");
    setMission("");
    setRisk("All Risk Levels");
    setModel("All AI Models");
    setStatus("All Statuses");
  };
  const exportCsv = () => {
    const csv = [
      "Record ID,Mission ID,UAV ID,AI Model,Cluster Label,Anomaly Score,Risk Level,Final Decision,Maintenance Required,Status,Closed Date",
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flightinsight-anomaly-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(`${rows.length} anomaly records exported as CSV.`);
  };
  return (
    <>
      <PageHead
        title="Report & Anomaly Logs"
        actions={
          <>
            <Button kind="secondary" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button
              onClick={() =>
                notify(
                  `Report generated with ${rows.length} matching anomaly records.`,
                )
              }
            >
              Generate Report
            </Button>
          </>
        }
      />
      <div className="toolbar report-filters">
        <Field label="From date">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="UAV ID">
          <select value={uav} onChange={(e) => setUav(e.target.value)}>
            <option>All UAVs</option>
            {["UAV-07", "UAV-02", "UAV-05", "UAV-03"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Mission ID">
          <input
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Mission ID"
          />
        </Field>
        <Field label="Risk Level">
          <select value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option>All Risk Levels</option>
            {["Critical", "High", "Medium", "Low"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="AI Model">
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option>All AI Models</option>
            <option>DBSCAN</option>
            <option>K-Means</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All Statuses</option>
            <option>Closed</option>
            <option>False Alarm</option>
          </select>
        </Field>
        <button className="clear-filter" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="filter-count">{rows.length} matching records</div>
      <div className="metrics-grid five">
        <Metric
          label="Total Flights"
          value={String(missions.length)}
          meta="Current workflow state"
        />
        <Metric
          label="Total Anomalies"
          value="38"
          meta="7.8% anomaly rate"
          tone="amber"
        />
        <Metric label="False Alarms" value="6" meta="15.8% of alerts" />
        <Metric
          label="Maintenance Cases"
          value="19"
          meta="50% of anomalies"
          tone="amber"
        />
        <Metric
          label="Avg. Resolution Time"
          value="18m 42s"
          meta="32% faster vs AS-IS"
          tone="green"
        />
      </div>
      <Card title="Anomaly Log">
        {rows.length ? (
          <Table
            headers={[
              "Record ID",
              "Mission",
              "UAV",
              "AI Model",
              "Cluster",
              "Score",
              "Risk",
              "Final Decision",
              "Maintenance",
              "Status",
              "Closed Date",
            ]}
            rows={rows.map((r) => [
              <b>{r.record}</b>,
              r.mission,
              r.uav,
              r.model,
              r.cluster,
              r.score,
              <Badge>{r.risk}</Badge>,
              r.decision,
              r.maintenance,
              <Badge>{r.status}</Badge>,
              r.date,
            ])}
          />
        ) : (
          <EmptyState
            title="No anomaly records match"
            action="Reset filters"
            onAction={reset}
          />
        )}
      </Card>
      <Card title="Process Improvement: AS-IS vs TO-BE">
        <div className="comparison">
          <div className="compare-head">
            <span>Process measure</span>
            <b>AS-IS process</b>
            <b>TO-BE with FlightInsight</b>
            <i>Impact</i>
          </div>
          {[
            [
              "Processing time",
              "30 to 45 minutes",
              "Under 5 minutes",
              "85% faster",
            ],
            [
              "Manual work",
              "High, continuous checks",
              "Exception-based review",
              "Reduced",
            ],
            [
              "Decision accuracy",
              "Operator dependent",
              "AI-assisted scoring",
              "Improved",
            ],
            [
              "Error / risk level",
              "Delayed detection",
              "Real-time alerts",
              "Lower risk",
            ],
            [
              "Data visibility",
              "Fragmented logs",
              "Unified dashboard",
              "End-to-end",
            ],
            [
              "Monitoring capability",
              "Periodic",
              "Real-time telemetry",
              "Continuous",
            ],
            [
              "Stakeholder coordination",
              "Manual handoffs",
              "Workflow assignment",
              "Automated",
            ],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
              <b>{x[2]}</b>
              <i>{x[3]}</i>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export default App;
