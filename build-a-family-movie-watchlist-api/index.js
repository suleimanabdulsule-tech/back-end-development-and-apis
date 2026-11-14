import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";
import {
  addMovie,
  deleteMovie,
  findByUsername,
  getWatchlist,
  updateMovie,
} from "./utils/db.js";

const app = express();
app.use(helmet());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Family Movie Watchlist API");
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "1h" },
  );
  return res.json({ token });
});

app.use("/api/watchlist", authenticate);

app.get("/api/watchlist/:userId", (req, res) => {
  const watchlist = getWatchlist(Number(req.params.userId));
  if (watchlist === null) {
    return res.status(404).json({ error: "User not found." });
  }
  return res.json(watchlist);
});

app.post("/api/watchlist/:userId/movies", authorizeModification, (req, res) => {
  const { title, genre } = req.body ?? {};
  if (typeof title !== "string" || !title.trim() ||
      typeof genre !== "string" || !genre.trim()) {
    return res.status(400).json({ error: "Title and genre are required." });
  }

  const movie = addMovie(Number(req.params.userId), {
    title: title.trim(),
    genre: genre.trim(),
  });
  if (!movie) {
    return res.status(404).json({ error: "User not found." });
  }
  return res.status(201).json(movie);
});

const moviePath = "/api/watchlist/:userId/movies/:movieId";

app.put(moviePath, authorizeModification, (req, res) => {
  const { title, genre, watched } = req.body ?? {};
  const updates = {};

  for (const [key, value] of Object.entries({ title, genre })) {
    if (value === undefined) continue;
    if (typeof value !== "string" || !value.trim()) {
      return res.status(400).json({ error: `${key} must be a non-empty string.` });
    }
    updates[key] = value.trim();
  }

  if (watched !== undefined) {
    if (typeof watched !== "boolean") {
      return res.status(400).json({ error: "watched must be a boolean." });
    }
    updates.watched = watched;
  }

  const movie = updateMovie(
    Number(req.params.userId), Number(req.params.movieId), updates,
  );
  if (!movie) {
    return res.status(404).json({ error: "Movie not found." });
  }
  return res.json(movie);
});

app.delete(moviePath, authorizeModification, (req, res) => {
  const deleted = deleteMovie(Number(req.params.userId), Number(req.params.movieId));
  if (!deleted) {
    return res.status(404).json({ error: "Movie not found." });
  }
  return res.json({ message: "Movie removed." });
});

app.listen(3000, () => {
  console.log("Family Movie Watchlist API listening on http://localhost:3000");
});
