import { useEffect, useRef, useState } from "react";
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
    caixa2Folder: "knight_caixa2",
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
  const [caixa2, setCaixa2] = useState(false);

  const [frame, setFrame] = useState(1);
  const [bossFrame, setBossFrame] = useState(1);

  const [customName, setCustomName] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [alerts, setAlerts] = useState([{ name: "Pot Skill", time: 600 }]);
  const endTimeRef = useRef(null);

  const audioCtxRef = useRef(null);
  const alertBufferRef = useRef(null);
  const scheduledAlertRef = useRef(null);

  const runningRef = useRef(false);
  const repeatPotSkillRef = useRef(true);

  useEffect(() => {
   runningRef.current = running;
  }, [running]);

  useEffect(() => {
    repeatPotSkillRef.current = repeatPotSkill;
  }, [repeatPotSkill]);

    useEffect(() => {
    if (!running || !endTimeRef.current) return;

    const updateTimer = () => {
      const now = Date.now();
      let remaining = Math.ceil(
        (endTimeRef.current - now) / 1000
      );

      if (remaining <= 0) {
        if (repeatPotSkillRef.current) {
          while (endTimeRef.current <= now) {
            endTimeRef.current += 600000;
          }

          remaining = Math.ceil(
            (endTimeRef.current - now) / 1000
          );
        } else {
          runningRef.current = false;
          setRunning(false);
          setSeconds(600);
          return;
        }
      }

      setSeconds(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 250);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTimer();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [running]);

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

  async function prepareAudio() {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const audioContext = audioCtxRef.current;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (!alertBufferRef.current) {
      const response = await fetch("/alert.mp3");
      const arrayBuffer = await response.arrayBuffer();

      alertBufferRef.current =
        await audioContext.decodeAudioData(arrayBuffer);
    }
  }

  function stopScheduledAlert() {
    if (!scheduledAlertRef.current) return;

    scheduledAlertRef.current.onended = null;

    try {
      scheduledAlertRef.current.stop();
    } catch {
      // já terminou
    }

    scheduledAlertRef.current = null;
  }

  async function scheduleAlert(delaySeconds) {
    await prepareAudio();

    stopScheduledAlert();

    const audioContext = audioCtxRef.current;

    const source = audioContext.createBufferSource();

    source.buffer = alertBufferRef.current;
    source.connect(audioContext.destination);

    scheduledAlertRef.current = source;

    source.onended = () => {
      if (scheduledAlertRef.current === source) {
        scheduledAlertRef.current = null;
      }

      if (
        runningRef.current &&
        repeatPotSkillRef.current
      ) {
        scheduleAlert(600);
      }
    };

    source.start(
      audioContext.currentTime + delaySeconds
    );
  }

  function formatTime(value) {
    const min = Math.floor(value / 60);
    const sec = value % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  async function startPotSkill() {
    if (runningRef.current) return;

    try {
      await prepareAudio();
    } catch (error) {
      console.error("Erro ao preparar áudio:", error);
    }

    const duration = seconds > 0 ? seconds : 600;

    endTimeRef.current =
      Date.now() + duration * 1000;

    runningRef.current = true;
    setRunning(true);

    try {
      await scheduleAlert(duration);
    } catch (error) {
      console.error("Erro ao agendar alerta:", error);
    }
  }

  function pausePotSkill() {
    if (!runningRef.current) return;

    const remaining = endTimeRef.current
      ? Math.max(
          0,
          Math.ceil(
            (endTimeRef.current - Date.now()) / 1000
          )
        )
      : seconds;

    runningRef.current = false;

    setRunning(false);
    setSeconds(remaining);

    endTimeRef.current = null;

    stopScheduledAlert();
  }

  function resetPotSkill() {
    runningRef.current = false;

    setRunning(false);
    setSeconds(600);

    endTimeRef.current = null;

    stopScheduledAlert();
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
            <button className="start" onClick={startPotSkill}>
              ▶ Iniciar
            </button>

            <button className="pause" onClick={pausePotSkill}>
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

          <label className="massadaToggle">
            <input
              type="checkbox"
              checked={caixa2}
              onChange={(e) => setCaixa2(e.target.checked)}
            />
            Caixa 2
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
            .map((p) => {
              const currentFolder =
                caixa2 && p.caixa2Folder ? p.caixa2Folder : p.folder;

              return (
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
                    src={`/assets/players/${currentFolder}/${frame}.png`}
                    alt={p.name}
                  />
                </div>
              );
            })}
        </div>

        <footer>Tibia Timer © 2026 | Feito para hunters ⚔️</footer>
      </main>
    </div>
  );
}