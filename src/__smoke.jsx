/* eslint-disable */
// اختبار تشغيل مؤقت — يُحذف بعد التشخيص
import "./__smoke-globals.jsx";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import StudentLogin from "./pages/StudentLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LabHistory from "./pages/LabHistory.jsx";
import Exams from "./pages/Exams.jsx";
import ScenarioLab from "./pages/ScenarioLab.jsx";
import SettingsPage from "./pages/Settings.jsx";
import NetworkSimulator from "./pages/NetworkSimulator.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import TakeExam from "./pages/TakeExam.jsx";
import Layout from "./components/Layout.jsx";
import { AuthProvider } from "./lib/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client";

function tryRender(name, Component, wrap) {
  try {
    const el = wrap ? wrap(React.createElement(Component)) : React.createElement(Component);
    const html = renderToString(el);
    console.log(`OK   ${name} (${html.length} chars)`);
  } catch (e) {
    console.error(`FAIL ${name}:`, e && e.stack ? e.stack.split("\n").slice(0, 6).join("\n") : e);
  }
}

const fullWrap = (el) => React.createElement(
  QueryClientProvider, { client: queryClientInstance },
  React.createElement(AuthProvider, null, React.createElement(MemoryRouter, null, el))
);

tryRender("App", App, fullWrap);
tryRender("StudentLogin", StudentLogin, fullWrap);
tryRender("Home", Home, fullWrap);
tryRender("Dashboard", Dashboard, fullWrap);
tryRender("LabHistory", LabHistory, fullWrap);
tryRender("Exams", Exams, fullWrap);
tryRender("ScenarioLab", ScenarioLab, fullWrap);
tryRender("Settings", SettingsPage, fullWrap);
tryRender("Layout", Layout, fullWrap);
tryRender("NetworkSimulator", NetworkSimulator, fullWrap);
tryRender("TopicPage", TopicPage, fullWrap);
tryRender("TakeExam", TakeExam, fullWrap);
console.log("SMOKE DONE");