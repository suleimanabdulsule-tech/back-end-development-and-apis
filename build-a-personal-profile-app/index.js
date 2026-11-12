const express = require("express");

const app = express();

app.get("/", (_req, res) => {
  res.type("text/plain").send("Welcome to Camper Bot's homepage!");
});

app.get("/hobbies", (_req, res) => {
  res.type("text/plain").send("I cycle, go boating, and play guitar.");
});

app.get("/skills", (_req, res) => {
  res.type("text/plain").send("JavaScript, Node.js, and Express.js!");
});

app.get("/api/profile", (_req, res) => {
  res.json({
    name: "Camper Bot",
    hobbies: ["cycling", "boating", "guitar"],
    skills: ["JavaScript", "Node.js", "Express.js"],
  });
});

const server = app.listen(3000);

server.on("listening", () => {
  console.log("Personal Profile App listening on http://localhost:3000");
});

server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
