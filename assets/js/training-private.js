import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const config = window.trainingCloudConfig || {};
const isConfigured = Boolean(
  config.supabaseUrl && config.supabasePublishableKey,
);
const root = document.getElementById("training-dashboard");
const access = document.getElementById("training-private-access");
const message = document.getElementById("training-private-message");
const actions = document.getElementById("training-private-actions");
const storageKey = root?.dataset.storageKey;
let supabase;
let currentSession;

function readLocalSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function writeLocalSessions(sessions) {
  localStorage.setItem(storageKey, JSON.stringify(sessions));
}

function setDashboardLocked(locked) {
  root?.classList.toggle("training-dashboard-locked", locked);
  access?.classList.toggle("training-private-access-hidden", !locked);
}

function setStorageMessage(cloud) {
  const label = document.getElementById("training-privacy-label");
  const notice = document.getElementById("training-storage-notice");
  if (!label || !notice) return;
  label.textContent = cloud
    ? "PRIVATE · CLOUD SYNCED"
    : "PRIVATE · ON THIS DEVICE";
  notice.innerHTML = cloud
    ? '<i class="fa-solid fa-shield-halved" aria-hidden="true"></i><div><strong>Private cloud mode</strong><span>Your entries are encrypted in transit and protected in the database by your sign-in. They are never committed to GitHub.</span></div>'
    : '<i class="fa-solid fa-laptop" aria-hidden="true"></i><div><strong>Local private mode</strong><span>Your entries stay in this browser. They are not uploaded to the website or committed to GitHub.</span></div>';
}

function setCoach(enabled, text = "") {
  const question = document.getElementById("training-coach-question");
  const ask = document.getElementById("training-coach-ask");
  const state = document.getElementById("training-coach-state");
  const copy = document.getElementById("training-coach-copy");
  question.disabled = !enabled;
  ask.disabled = !enabled;
  state.textContent = enabled ? "PRIVATE COACH" : "PRIVATE SETUP REQUIRED";
  copy.textContent = enabled
    ? "Ask a focused question about your recent sessions. Your coach receives only your protected training data and responds through a secure server connection."
    : "Once private cloud access is configured, your coach can review recent training and suggest the next session. Your OpenAI key remains server-side.";
  if (text)
    document.getElementById("training-coach-response").textContent = text;
}

function actionButton(text, callback, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", callback);
  return button;
}

async function sendMagicLink() {
  const email = document.getElementById("training-login-email")?.value.trim();
  if (!email) {
    message.textContent = "Enter your email address first.";
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  message.textContent = error
    ? `Could not send the sign-in link: ${error.message}`
    : "Check your email for the private sign-in link.";
}

async function enablePasskey() {
  message.textContent =
    "Opening your device’s secure Face ID / passkey prompt…";
  const { error } = await supabase.auth.registerPasskey({
    friendlyName: "Harshit’s training dashboard",
  });
  message.textContent = error
    ? `Passkey setup did not finish: ${error.message}`
    : "Face ID / passkey is ready for this device.";
}

async function signInWithPasskey() {
  const { error } = await supabase.auth.signInWithPasskey();
  if (error)
    message.textContent = `Passkey sign-in did not finish: ${error.message}`;
}

async function syncLocalToCloud() {
  const sessions = readLocalSessions();
  if (!sessions.length || !currentSession) return;
  const records = sessions.map((session) => ({
    client_id: String(session.id),
    occurred_at: session.created_at,
    payload: session,
  }));
  const { error } = await supabase
    .from("training_sessions")
    .upsert(records, { onConflict: "user_id,client_id" });
  if (error) throw error;
}

async function syncCloudToLocal() {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("client_id, payload")
    .order("occurred_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const merged = new Map(
    readLocalSessions().map((session) => [String(session.id), session]),
  );
  (data || []).forEach((record) => {
    if (record.payload) merged.set(String(record.client_id), record.payload);
  });
  const sessions = [...merged.values()].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
  writeLocalSessions(sessions);
  window.dispatchEvent(new Event("training:cloud-synced"));
}

async function syncOneSession(session) {
  if (!currentSession) return;
  const { error } = await supabase.from("training_sessions").upsert(
    {
      client_id: String(session.id),
      occurred_at: session.created_at,
      payload: session,
    },
    { onConflict: "user_id,client_id" },
  );
  if (error) throw error;
}

async function showSignedIn() {
  setDashboardLocked(false);
  setStorageMessage(true);
  setCoach(true);
  message.textContent = `Signed in privately as ${currentSession.user.email}.`;
  actions.replaceChildren(
    actionButton("Enable Face ID / passkey", enablePasskey),
    actionButton("Sign out", () => supabase.auth.signOut()),
  );
  access.classList.remove("training-private-access-hidden");
  try {
    await syncLocalToCloud();
    await syncCloudToLocal();
    message.textContent = "Private cloud sync is up to date.";
  } catch (error) {
    message.textContent = `Signed in, but sync needs attention: ${error.message}`;
  }
}

function showSignedOut() {
  setDashboardLocked(true);
  setCoach(false);
  message.textContent =
    "Sign in to open your private dashboard. Your public training plan remains separate.";
  actions.replaceChildren();
  const input = document.createElement("input");
  input.type = "email";
  input.id = "training-login-email";
  input.placeholder = "you@email.com";
  input.autocomplete = "email";
  actions.append(
    input,
    actionButton("Email me a sign-in link", sendMagicLink),
    actionButton("Use Face ID / passkey", signInWithPasskey),
  );
}

async function askCoach() {
  const question = document
    .getElementById("training-coach-question")
    .value.trim();
  const response = document.getElementById("training-coach-response");
  if (!question) {
    response.textContent = "Write a question for your coach first.";
    return;
  }
  response.textContent = "Reviewing your recent training…";
  const { data, error } = await supabase.functions.invoke(
    config.coachFunction || "training-coach",
    { body: { question } },
  );
  response.textContent = error
    ? `Coach unavailable: ${error.message}`
    : data?.answer || "The coach returned no answer.";
}

async function init() {
  if (!root || !access) return;
  document
    .getElementById("training-coach-ask")
    ?.addEventListener("click", askCoach);
  if (!isConfigured) {
    access.classList.add("training-private-access-hidden");
    setDashboardLocked(false);
    setStorageMessage(false);
    setCoach(false);
    return;
  }
  supabase = createClient(config.supabaseUrl, config.supabasePublishableKey);
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  if (currentSession) await showSignedIn();
  else showSignedOut();
  supabase.auth.onAuthStateChange(async (_event, nextSession) => {
    currentSession = nextSession;
    if (currentSession) await showSignedIn();
    else showSignedOut();
  });
  window.addEventListener("training:session-saved", async (event) => {
    try {
      await syncOneSession(event.detail);
      document.getElementById("training-save-status").textContent =
        "Workout saved and privately synced.";
    } catch (error) {
      document.getElementById("training-save-status").textContent =
        "Saved locally; cloud sync will retry next sign-in.";
      console.warn("Training cloud sync failed", error);
    }
  });
}

init();
