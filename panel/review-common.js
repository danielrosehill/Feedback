// Shared by the text and email review pages: session load, voice recorder, autosave, comment cards.
// A page sets FB.render (draw everything), FB.describe(c) -> {where, quote, doc} and FB.extra() ->
// extra fields for /api/comments (verdict, verdicts, picked_subject, general_note), then calls FB.load().
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const fmt = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const FB = window.FB = {
    esc, fmt, items: null, comments: [], outcomes: {}, intents: [], fieldIntents: [], verdicts: [], response: {},
    sel: null, recState: null, stream: null, saveT: null,
    render: () => {}, describe: c => ({ where: c.scope }), extra: () => ({}),
    uid: () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
  };

  FB.status = t => { const e = $("#status"); if (e) e.textContent = t; };

  FB.load = async function () {
    const r = await (await fetch("api/session")).json();
    Object.assign(FB, { items: r.items, comments: r.comments || [], outcomes: r.outcomes || {}, intents: r.intents || [],
      fieldIntents: r.field_intents || [], verdicts: r.verdicts || [], response: r.response || {} });
    document.title = "Feedback – " + (FB.items.title || "");
    FB.status(FB.response.status || "draft");
    return r;
  };

  FB.addComment = async function (c, record = true) {
    if (FB.recState) await FB.stopRec();
    c.id = FB.uid(); c.note = c.note || ""; FB.comments.push(c); FB.sel = c.id; FB.render(); await FB.save();
    if (record) FB.startRec(c.id);
    return c;
  };

  FB.remove = async function (id) {
    if (FB.recState && FB.recState.id === id) await FB.stopRec(true);
    FB.comments = FB.comments.filter(x => x.id !== id); FB.render(); FB.save();
  };

  FB.startRec = async function (id) {
    if (FB.recState) await FB.stopRec();
    try { FB.stream = FB.stream || await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) { const m = $("#micerr"); if (m) { m.style.display = "block"; m.textContent = "Microphone not available (" + e.message + "). You can still type notes."; } FB.render(); return; }
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
    const mr = new MediaRecorder(FB.stream, mime ? { mimeType: mime } : {});
    const chunks = [], t0 = Date.now();
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    FB.recState = { id, mr, chunks, t0, tick: setInterval(() => { const t = $("#timer"); if (t) t.textContent = fmt((Date.now() - t0) / 1000); }, 250) };
    mr.start(1000); FB.render(); FB.status("recording…");
  };

  FB.stopRec = function (discard) {
    return new Promise(resolve => {
      if (!FB.recState) return resolve();
      const { id, mr, chunks, t0, tick } = FB.recState; clearInterval(tick);
      mr.onstop = async () => {
        FB.recState = null;
        const c = FB.comments.find(x => x.id === id);
        if (!discard && c && chunks.length && Date.now() - t0 > 600) {
          FB.status("uploading…");
          const r = await fetch(`api/audio?id=${id}&ext=webm`, { method: "POST", body: new Blob(chunks, { type: mr.mimeType || "audio/webm" }) });
          if (r.ok) { c.audio = (await r.json()).audio; c.duration_s = Math.round((Date.now() - t0) / 100) / 10; c._v = Date.now(); delete c.transcript; }
        }
        FB.render(); await FB.save(); resolve();
      };
      mr.stop();
    });
  };

  FB.save = function (submit) {
    clearTimeout(FB.saveT);
    const go = async () => {
      const body = Object.assign({ comments: FB.comments.map(({ _n, _v, ...c }) => c), submit: !!submit }, FB.extra());
      const r = await fetch("api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json(); FB.status(j.status === "submitted" ? "submitted ✓" : "saved " + new Date().toLocaleTimeString());
    };
    if (submit) return go();
    return new Promise(res => { FB.saveT = setTimeout(async () => { await go(); res(); }, 300); });
  };

  FB.submit = async () => { if (FB.recState) await FB.stopRec(); await FB.save(true); };

  // One comment card. opts.intents: list to offer (defaults to wording intents when category is Wording).
  FB.card = function (c, n) {
    const d = FB.describe(c), rec = FB.recState && FB.recState.id === c.id;
    const div = document.createElement("div");
    div.className = "card" + (c.id === FB.sel ? " sel" : ""); div.id = "card-" + c.id;
    const cats = (FB.items.categories || []).map(k => `<span class="chip${c.category === k ? " on" : ""}" data-cat="${esc(k)}">${esc(k)}</span>`).join("");
    const ints = c.category === "Wording" ? FB.intents.map(k => `<span class="chip intent${c.intent === k ? " on" : ""}" data-int="${esc(k)}">${esc(k)}</span>`).join("") : "";
    div.innerHTML = `<div class="top"><span><span class="badge ${d.doc ? "doc" : ""}">${n}</span>${esc(d.where)}</span><button class="small" data-del title="Delete">✕</button></div>
      ${d.quote ? `<div class="quote" dir="auto">${esc(d.quote)}</div>` : ""}
      <div class="chips">${cats}</div>${ints ? `<div class="chips">${ints}</div>` : ""}
      <div class="row">${rec ? `<button class="rec small" data-stop>■ Stop</button><span class="timer" id="timer">0:00</span>`
        : `<button class="small" data-rec>${c.audio ? "🎙 Re-record" : "🎙 Record"}</button>${c.duration_s ? `<span class="dur">${fmt(c.duration_s)}</span>` : ""}`}</div>
      ${c.audio && !rec ? `<audio controls preload="none" src="audio/${c.audio}?t=${c._v || 0}"></audio>` : ""}
      ${c.transcript ? `<div class="transcript" dir="auto">${esc(c.transcript)}</div>` : ""}
      <textarea dir="auto" placeholder="…or type a note">${esc(c.note || "")}</textarea>
      ${FB.outcomes[c.id] ? `<div class="outcome">${esc(FB.outcomes[c.id].state + (FB.outcomes[c.id].text ? ": " + FB.outcomes[c.id].text : ""))}</div>` : ""}`;
    div.onclick = e => { if (!["TEXTAREA", "AUDIO", "BUTTON"].includes(e.target.tagName) && !e.target.classList.contains("chip") && FB.sel !== c.id) { FB.sel = c.id; FB.render(); FB.onSelect && FB.onSelect(c); } };
    div.querySelector("[data-del]").onclick = e => { e.stopPropagation(); FB.remove(c.id); };
    div.querySelectorAll("[data-cat]").forEach(ch => ch.onclick = e => { e.stopPropagation(); c.category = c.category === ch.dataset.cat ? null : ch.dataset.cat; if (c.category !== "Wording" && FB.intents.includes(c.intent)) delete c.intent; FB.render(); FB.save(); });
    div.querySelectorAll("[data-int]").forEach(ch => ch.onclick = e => { e.stopPropagation(); c.intent = c.intent === ch.dataset.int ? null : ch.dataset.int; FB.render(); FB.save(); });
    const rb = div.querySelector("[data-rec]"); if (rb) rb.onclick = e => { e.stopPropagation(); FB.sel = c.id; FB.startRec(c.id); };
    const sb = div.querySelector("[data-stop]"); if (sb) sb.onclick = e => { e.stopPropagation(); FB.stopRec(); };
    div.querySelector("textarea").oninput = e => { c.note = e.target.value; FB.save(); };
    return div;
  };

  FB.verdictChips = function (el, current, onPick) {
    el.innerHTML = "";
    for (const v of FB.verdicts) {
      const b = document.createElement("span"); b.className = "chip" + (current === v ? " on" : ""); b.textContent = v;
      b.onclick = () => onPick(current === v ? null : v); el.appendChild(b);
    }
  };

  document.addEventListener("keydown", async e => {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    if (e.key === "Escape" && FB.recState) { e.preventDefault(); await FB.stopRec(); }
    else if ((e.key === "r" || e.key === "R") && FB.sel && !FB.recState) { e.preventDefault(); FB.startRec(FB.sel); }
  });

  setInterval(async () => {  // transcripts and outcomes written while the page is open
    if (FB.recState || !FB.items) return;
    try {
      const r = await (await fetch("api/session")).json(); FB.outcomes = r.outcomes || {}; let changed = false;
      for (const c of r.comments || []) { const m = FB.comments.find(x => x.id === c.id); if (m && c.transcript && m.transcript !== c.transcript && m.audio === c.audio) { m.transcript = c.transcript; changed = true; } }
      if (changed && !document.activeElement?.matches("textarea")) FB.render();
    } catch (e) {}
  }, 5000);
})();
