import { useEffect, useState } from "react";
import "./App.css";

const players = [
  {
    name: "Old Jeremy",
    className: "player monk",
    folder: "monk",
    color: "#ffd166",
    nameBottom: "170px",
    nameLeft: "50%",
  },
  {
    name: "Old Coy",
    className: "player archer",
    folder: "archer",
    color: "#90ee90",
    nameBottom: "145px",
    nameLeft: "50%",
  },
  {
    name: "Ruivo",
    className: "player sorcerer",
    folder: "sorcerer",
    color: "#ff6b6b",
    nameBottom: "160px",
    nameLeft: "40%",
    hiddenByMassada: true,
  },
  {
    name: "Old Kav",
    className: "player druid",
    folder: "druid",
    color: "#7cff8b",
    nameBottom: "140px",
    nameLeft: "48%",
  },
  {
    name: "Old Ginka",
    className: "player knight",
    folder: "knight",
    color: "#8ecbff",
    nameBottom: "170px",
    nameLeft: "60%",
  },
];

export default function App() {
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [repeatPotSkill, setRepeatPotSkill] = useState(true);
  const [massada, setMassada] = useState(false);

  const [frame, setFrame] = useState(1);
  const [bossFrame, setBossFrame] = useState(1);

  const [customName, setCustomName] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [alerts, setAlerts] = useState([{ name: "Pot Skill", time: 600 }]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          playAlert();

          if (repeatPotSkill) {
            return 600;
          }

          setRunning(false);
          alert("Pot Skill acabou!");
          return 600;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, repeatPotSkill]);

  useEffect(() => {
    if (!animations) return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 220);

    return () => clearInterval(interval);
  }, [animations]);

  useEffect(() => {
    if (!animations) return;

    const interval = setInterval(() => {
      setBossFrame((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 350);

    return () => clearInterval(interval);
  }, [animations]);

  function playAlert() {
    const audio = new Audio("/alert.mp3");
    audio.play().catch(() => {});
  }

  function formatTime(value) {
    const min = Math.floor(value / 60);
    const sec = value % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function resetPotSkill() {
    setRunning(false);
    setSeconds(600);
  }

  function addCustomTimer() {
    const min = Number(customMinutes || 0);
    const sec = Number(customSeconds || 0);
    const total = min * 60 + sec;

    if (!customName || total <= 0) {
      alert("Preencha nome e tempo do timer.");
      return;
    }

    setAlerts((prev) => [...prev, { name: customName, time: total }]);

    setCustomName("");
    setCustomMinutes("");
    setCustomSeconds("");
  }

  return (
    <div className={`app ${animations ? "" : "paused"}`}>
      <aside className="sidebar">
        <div className="logoBox">
          <span className="logoIcon">🛡️</span>
          <h1>Tibia Timer</h1>
          <span className="torch">🔥</span>
        </div>

        <section className="panel">
          <h2>🧪 Pot Skill</h2>

          <div className="timerDisplay">{formatTime(seconds)}</div>

          <label className="checkRow">
            <input
              type="checkbox"
              checked={repeatPotSkill}
              onChange={(e) => setRepeatPotSkill(e.target.checked)}
            />
            Repetir automaticamente
          </label>

          <div className="buttons">
            <button className="start" onClick={() => setRunning(true)}>
              ▶ Iniciar
            </button>

            <button className="pause" onClick={() => setRunning(false)}>
              ⏸ Pausar
            </button>

            <button className="reset" onClick={resetPotSkill}>
              ↻ Resetar
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>⏳ Criar timer personalizado</h2>

          <label>Nome do timer</label>
          <input
            placeholder="Ex: Utito Tempo"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          <div className="timeInputs">
            <div>
              <label>Minutos</label>
              <input
                placeholder="00"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
              />
            </div>

            <div>
              <label>Segundos</label>
              <input
                placeholder="00"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(e.target.value)}
              />
            </div>
          </div>

          <button className="add" onClick={addCustomTimer}>
            ✦ Adicionar timer
          </button>
        </section>

        <section className="panel">
          <h2>🔔 Alertas ativos</h2>

          {alerts.map((item, index) => (
            <div className="alertItem" key={index}>
              <span>🟢 {item.name}</span>
              <strong>{formatTime(item.time)}</strong>
            </div>
          ))}
        </section>

        <section className="panel small">
          <button className="animationBtn" onClick={() => setAnimations(!animations)}>
            {animations ? "🏃 Animações: ON" : "⏸ Animações: OFF"}
          </button>
        </section>
      </aside>

      <main className="gameArea">
        <div className="topControls">
          <button onClick={() => setAnimations(!animations)}>
            {animations ? "⏸ Pausar animações" : "▶ Ativar animações"}
          </button>

          <label className="massadaToggle">
            <input
              type="checkbox"
              checked={massada}
              onChange={(e) => setMassada(e.target.checked)}
            />
            Massada
          </label>
        </div>

        <div className="battleScene">
          <div className="bossPlaceholder">
            <div className="bossName">Rotrender</div>

            <div className="bossHp">
              <span />
            </div>

            <img
              className="bossSpriteImage"
              src={`/assets/boss/${bossFrame}.png`}
              alt="Rotrender"
            />
          </div>

          {players
            .filter((p) => !(massada && p.hiddenByMassada))
            .map((p) => (
              <div className={p.className} key={p.name}>
                <div
                  className="playerName"
                  style={{
                    color: p.color,
                    bottom: p.nameBottom,
                    left: p.nameLeft,
                  }}
                >
                  {p.name}
                </div>

                <img
                  className="playerSprite"
                  src={`/assets/players/${p.folder}/${frame}.png`}
                  alt={p.name}
                />
              </div>
            ))}
        </div>

        <footer>Tibia Timer © 2026 | Feito para hunters ⚔️</footer>
      </main>
    </div>
  );
}