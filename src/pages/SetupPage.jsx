import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";

/**
 * Curated list of browser SpeechSynthesis voices we want to surface.
 * The Web Speech API exposes dozens of voices — we map a friendly subset.
 * At runtime we match these against window.speechSynthesis.getVoices().
 */
const PREFERRED_VOICES = [
  { name: "Google US English",        lang: "en-US", gender: "Female", accent: "US",      desc: "Natural & clear"        },
  { name: "Google UK English Female", lang: "en-GB", gender: "Female", accent: "British", desc: "British accent"         },
  { name: "Google UK English Male",   lang: "en-GB", gender: "Male",   accent: "British", desc: "British accent"         },
  { name: "Microsoft David",          lang: "en-US", gender: "Male",   accent: "US",      desc: "Professional"           },
  { name: "Microsoft Zira",           lang: "en-US", gender: "Female", accent: "US",      desc: "Warm & polished"        },
  { name: "Microsoft Mark",           lang: "en-US", gender: "Male",   accent: "US",      desc: "Clear & authoritative"  },
  { name: "Alex",                     lang: "en-US", gender: "Male",   accent: "US",      desc: "macOS default"          },
  { name: "Samantha",                 lang: "en-US", gender: "Female", accent: "US",      desc: "macOS natural"          },
];

function useBrowserVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    function load() {
      const all = window.speechSynthesis.getVoices();
      if (!all.length) return;

      // Try to match preferred voices first
      const englishVoices = all.filter(v => v.lang.startsWith("en"));

      // Build a curated list: match preferred names, then fill with any remaining English voices
      const matched = [];
      const usedNames = new Set();

      for (const pref of PREFERRED_VOICES) {
        const found = englishVoices.find(v =>
          v.name.toLowerCase().includes(pref.name.toLowerCase())
        );
        if (found && !usedNames.has(found.name)) {
          matched.push({
            nativeName: found.name,
            displayName: pref.name.split(" ").pop() || found.name,
            lang: found.lang,
            gender: pref.gender,
            accent: pref.accent,
            desc: pref.desc,
            voice: found
          });
          usedNames.add(found.name);
        }
      }

      // Fill remaining slots with other English voices (up to 8 total)
      const fallbackNames = ["Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn"];
      let fallbackIndex = 0;
      for (const v of englishVoices) {
        if (matched.length >= 8) break;
        if (usedNames.has(v.name)) continue;
        const fallbackName = fallbackNames[fallbackIndex % fallbackNames.length];
        matched.push({
          nativeName: v.name,
          displayName: fallbackName,
          lang: v.lang,
          gender: v.name.toLowerCase().includes("female") ? "Female" : fallbackName === "Jordan" ? "Male" : fallbackName === "Taylor" ? "Female" : "Male",
          accent: v.lang.includes("GB") ? "British" : v.lang.includes("IN") ? "Indian" : v.lang.includes("AU") ? "Australian" : "US",
          desc: (v.lang.includes("GB") ? "British" : v.lang.includes("IN") ? "Indian" : v.lang.includes("AU") ? "Australian" : "US") + " Voice",
          voice: v
        });
        usedNames.add(v.name);
        fallbackIndex++;
      }

      setVoices(matched);
    }

    load();
    window.speechSynthesis.onvoiceschanged = load;

    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  return voices;
}

function SetupPage() {
  const navigate = useNavigate();
  const { setup, setSetup, resetSession, requestResumeParsing, isLoading, apiError } = useInterview();

  const browserVoices = useBrowserVoices();

  const [role, setRole]                   = useState(setup.role);
  const [interviewType, setInterviewType] = useState(setup.interviewType);
  const [difficulty, setDifficulty]       = useState(setup.difficulty);
  const [voiceId, setVoiceId]             = useState(setup.voiceId || "");
  const [resumeText, setResumeText]       = useState("");
  const [resumeFile, setResumeFile]       = useState(null);
  const [localError, setLocalError]       = useState("");
  const [parseSuccess, setParseSuccess]   = useState("");

  // Auto-select first voice if user hasn't picked one yet
  useEffect(() => {
    if (!voiceId && browserVoices.length > 0) {
      setVoiceId(browserVoices[0].nativeName);
    }
  }, [browserVoices, voiceId]);

  function handleSubmit(event) {
    event.preventDefault();
    setSetup((prev) => ({ ...prev, role: role.trim(), interviewType, difficulty, voiceId }));
    resetSession();
    navigate("/interview");
  }

  async function handleParseResume() {
    setLocalError("");
    setParseSuccess("");
    if (!resumeFile && !resumeText.trim()) {
      setLocalError("Add resume text or upload a resume file first.");
      return;
    }
    try {
      await requestResumeParsing({ resumeText: resumeText.trim(), resumeFile, targetRoleHint: role.trim() });
      setParseSuccess("Resume parsed — interview questions will be personalized to your background.");
    } catch {}
  }

  function handlePreviewVoice(voiceName) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const match = browserVoices.find(v => v.nativeName === voiceName);
    if (!match) return;

    const utterance = new SpeechSynthesisUtterance("Hello! I will be your interview coach today.");
    utterance.voice = match.voice;
    utterance.lang = match.lang;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  const parsedResume = setup.parsedResume;
  const parsedSkills = Array.isArray(parsedResume?.coreSkills) ? parsedResume.coreSkills.slice(0, 8) : [];

  const selectStyle = {
    background: "rgba(6, 13, 30, 0.8)",
    border: "1px solid rgba(34, 211, 238, 0.15)",
    color: "#e2f0ff",
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontFamily: "Sora, sans-serif",
    fontSize: "0.9rem",
    appearance: "none",
    cursor: "pointer"
  };

  const selectedVoice = browserVoices.find(v => v.nativeName === voiceId) || browserVoices[0];

  return (
    <div className="fade-up">
      <div
        className="rounded-3xl p-8"
        style={{ background: "rgba(10, 22, 40, 0.85)", border: "1px solid rgba(34, 211, 238, 0.1)", backdropFilter: "blur(8px)" }}
      >
        <div className="mb-7">
          <div className="nova-badge mb-3 inline-block">STEP 1 OF 4</div>
          <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.01em" }}>Interview Setup</h2>
          <p className="text-sm mt-1" style={{ color: "#4a6a80" }}>Configure your session before we begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Target role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22d3ee", letterSpacing: "0.1em" }}>
              Target Role
            </label>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g., Frontend Engineer Intern"
              className="input-nova"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Interview type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22d3ee", letterSpacing: "0.1em" }}>
                Interview Type
              </label>
              <div className="relative">
                <select value={interviewType} onChange={e => setInterviewType(e.target.value)} style={selectStyle}>
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="system design">System Design</option>
                  <option value="data structures & algorithms">DS &amp; Algorithms</option>
                  <option value="product sense">Product Sense</option>
                  <option value="mixed">Mixed</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#22d3ee", fontSize: "0.7rem" }}>▾</span>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22d3ee", letterSpacing: "0.1em" }}>
                Difficulty
              </label>
              <div className="relative">
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selectStyle}>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#22d3ee", fontSize: "0.7rem" }}>▾</span>
              </div>
            </div>
          </div>

          {/* Voice selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22d3ee", letterSpacing: "0.1em" }}>
              AI Voice
            </label>

            {browserVoices.length === 0 ? (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fde68a" }}>
                Loading voices... If none appear, your browser may not support speech synthesis.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {browserVoices.map(v => {
                    const isSelected = voiceId === v.nativeName;
                    return (
                      <button
                        key={v.nativeName}
                        type="button"
                        onClick={() => setVoiceId(v.nativeName)}
                        onDoubleClick={() => handlePreviewVoice(v.nativeName)}
                        className="rounded-xl p-3 text-left transition-all"
                        style={{
                          background: isSelected ? "rgba(34,211,238,0.12)" : "rgba(6,13,30,0.6)",
                          border: isSelected ? "1px solid rgba(34,211,238,0.5)" : "1px solid rgba(34,211,238,0.08)",
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 12px rgba(34,211,238,0.1)" : "none"
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold" style={{ color: isSelected ? "#22d3ee" : "#e2f0ff" }}>
                            {v.displayName}
                          </span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: v.voice?.localService ? "rgba(167,139,250,0.15)" : "rgba(34,211,238,0.1)",
                              color: v.voice?.localService ? "#a78bfa" : "#22d3ee",
                              fontFamily: "JetBrains Mono, monospace",
                              letterSpacing: "0.05em"
                            }}
                          >
                            {v.voice?.localService ? "LOCAL" : "NET"}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: isSelected ? "#67e8f9" : "#3d6080" }}>{v.desc}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#2d4a60" }}>{v.gender} · {v.accent}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected voice preview strip */}
                {selectedVoice && (
                  <div
                    className="mt-2 rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
                    style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.1)" }}
                  >
                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(selectedVoice.nativeName)}
                      style={{ color: "#22d3ee", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit" }}
                    >
                      ▶
                    </button>
                    <span style={{ color: "#7acbd8" }}>
                      Selected: <strong style={{ color: "#e2f0ff" }}>{selectedVoice.displayName}</strong> — {selectedVoice.desc} · {selectedVoice.gender} · {selectedVoice.accent}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Resume section */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(6, 13, 30, 0.6)", border: "1px solid rgba(34, 211, 238, 0.08)" }}
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Resume Context</label>
              <span className="nova-badge">Optional · PDF or TXT</span>
            </div>

            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={4}
              placeholder="Paste your resume text here (optional)..."
              className="input-nova"
              style={{ resize: "vertical", minHeight: "80px" }}
            />

            {/* Upload button */}
            <label
              className="flex items-center gap-3 w-full cursor-pointer rounded-xl px-4 py-3 transition-all"
              style={{
                background: resumeFile ? "rgba(34,211,238,0.1)" : "rgba(34,211,238,0.06)",
                border: resumeFile ? "1.5px solid rgba(34,211,238,0.5)" : "1.5px dashed rgba(34,211,238,0.35)",
                boxShadow: resumeFile ? "0 0 14px rgba(34,211,238,0.12)" : "none"
              }}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee" }}
              >
                {resumeFile ? "✓" : "↑"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: resumeFile ? "#22d3ee" : "#c8dff0" }}>
                  {resumeFile ? resumeFile.name : "Upload Resume"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#3d6080" }}>
                  {resumeFile ? "File ready to parse" : "PDF or TXT · Click to browse"}
                </div>
              </div>
              {resumeFile && (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); setResumeFile(null); }}
                  className="flex-shrink-0 text-xs px-2 py-1 rounded"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  Remove
                </button>
              )}
              <input
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                onChange={e => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleParseResume}
              disabled={isLoading}
              className="btn-ghost text-sm px-4 py-2"
            >
              {isLoading ? "Parsing with HireSense..." : "Parse Resume with HireSense"}
            </button>

            {localError   && <p className="text-xs" style={{ color: "#fbbf24" }}>{localError}</p>}
            {apiError     && <p className="text-xs" style={{ color: "#f87171" }}>{apiError}</p>}
            {parseSuccess && <p className="text-xs" style={{ color: "#34d399" }}>{parseSuccess}</p>}
          </div>

          {/* Parsed resume preview */}
          {parsedResume && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(34, 211, 238, 0.05)", border: "1px solid rgba(34, 211, 238, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: "#22d3ee" }}>✓</span>
                <p className="text-sm font-semibold" style={{ color: "#22d3ee" }}>Resume Parsed</p>
              </div>
              <p className="text-sm mb-3" style={{ color: "#7acbd8" }}>{parsedResume.candidateSummary}</p>
              {parsedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", color: "#67e8f9" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-sm">
            Continue to Interview →
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupPage;
