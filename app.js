let currentTopicKey = null;
let quizIndex = 0;

const elTopics = document.getElementById("topics");
const elCurrentTopic = document.getElementById("currentTopic");
const elHeard = document.getElementById("heard");
const elTeacher = document.getElementById("teacherBubble");
const modeSelect = document.getElementById("modeSelect");
const btnListen = document.getElementById("btnListen");
const btnStop = document.getElementById("btnStop");

function speak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  u.pitch = 1.0;
  window.speechSynthesis.speak(u);
}

function setTeacherText(text) {
  elTeacher.textContent = text;
  speak(text);
}

function renderTopics() {
  elTopics.innerHTML = "";
  Object.keys(window.CURRICULUM).forEach((k) => {
    const btn = document.createElement("button");
    btn.className = "topicBtn";
    btn.textContent = k;
    btn.onclick = () => {
      currentTopicKey = k;
      quizIndex = 0;
      document.querySelectorAll(".topicBtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      elCurrentTopic.textContent = k;
      setTeacherText(`Selected ${k}. Say: "Teach me this" or "Quiz me".`);
    };
    elTopics.appendChild(btn);
  });
}

function getTopic() {
  if (!currentTopicKey) return null;
  return window.CURRICULUM[currentTopicKey];
}

function handleCommand(raw) {
  const text = raw.toLowerCase();

  // Change topic by speaking its name
  for (const k of Object.keys(window.CURRICULUM)) {
    if (text.includes(k.toLowerCase())) {
      currentTopicKey = k;
      quizIndex = 0;
      elCurrentTopic.textContent = k;
      setTeacherText(`Okay. Topic set to ${k}.`);
      return;
    }
  }

  const topic = getTopic();
  if (!topic) {
    setTeacherText("Pick a topic first.");
    return;
  }

  const mode = modeSelect.value;

  if (text.includes("teach") || mode === "teach") {
    const lesson = topic.teach.join(" ");
    setTeacherText(lesson);
    return;
  }

  if (text.includes("quiz") || mode === "quiz") {
    const item = topic.quiz[quizIndex % topic.quiz.length];
    setTeacherText(item.q);
    return;
  }

  if (text.includes("answer")) {
    const item = topic.quiz[quizIndex % topic.quiz.length];
    setTeacherText(`Suggested answer: ${item.a}`);
    quizIndex++;
    return;
  }

  if (mode === "review" || text.includes("review")) {
    setTeacherText(`Quick review of ${currentTopicKey}: ${topic.teach.join(" ")}`);
    return;
  }

  setTeacherText("Try saying: Teach, Quiz, or Answer.");
}

// --- Speech Recognition (Chrome) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;

if (SpeechRecognition) {
  rec = new SpeechRecognition();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.continuous = false;

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    elHeard.textContent = transcript;
    handleCommand(transcript);
  };

  rec.onerror = () => setTeacherText("Mic error. Try again.");
} else {
  setTeacherText("SpeechRecognition not supported here. Use Chrome.");
}

btnListen.addEventListener("mousedown", () => { if (rec) rec.start(); });
btnListen.addEventListener("mouseup", () => { if (rec) rec.stop(); });
btnListen.addEventListener("mouseleave", () => { if (rec) rec.stop(); });

btnStop.addEventListener("click", () => window.speechSynthesis.cancel());

renderTopics();
