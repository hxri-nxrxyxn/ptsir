const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path"); // Needed for file downloads

const app = express();
const PORT = process.env.PORT || 3001;
// IMPORTANT: In a real app, move this secret to a .env file!
const JWT_SECRET =
  "your-super-secret-and-long-key-that-is-not-so-secret-anymore";

// --- Core Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection Pool ---
const dbPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // No password as requested
  database: "lms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check database connection on startup
dbPool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:", err.message);
    process.exit(1);
  });

// --- API Router ---
const apiRouter = express.Router();
app.use("/api", apiRouter);

// =================================================================
// --- AUTHENTICATION & AUTHORIZATION MIDDLEWARE ---
// =================================================================

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adds { userId, role } to the request object
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

const adminOnly = (req, res, next) =>
  req.user.role === "admin"
    ? next()
    : res.status(403).json({ message: "Forbidden: Admin access required." });
const teacherOnly = (req, res, next) =>
  req.user.role === "teacher"
    ? next()
    : res.status(403).json({ message: "Forbidden: Teacher access required." });
const studentOnly = (req, res, next) =>
  req.user.role === "student"
    ? next()
    : res.status(403).json({ message: "Forbidden: Student access required." });
const teacherOrAdmin = (req, res, next) =>
  ["teacher", "admin"].includes(req.user.role)
    ? next()
    : res
        .status(403)
        .json({ message: "Forbidden: Teacher or Admin access required." });
const studentOrTeacherOrAdmin = (req, res, next) =>
  ["student", "teacher", "admin"].includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "Forbidden: Access denied." });

// =================================================================
// --- HELPER FUNCTIONS (for checking ownership/enrollment) ---
// =================================================================
const isTeacherOfCourse = async (teacherId, courseId) => {
  const [rows] = await dbPool.execute(
    "SELECT 1 FROM teachers_courses WHERE user_id = ? AND course_id = ?",
    [teacherId, courseId],
  );
  return rows.length > 0;
};

const isEnrolledInCourse = async (studentId, courseId) => {
  const [rows] = await dbPool.execute(
    "SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?",
    [studentId, courseId],
  );
  return rows.length > 0;
};

// =================================================================
// --- API ENDPOINTS ---
// =================================================================

// --- Test Route ---
apiRouter.get("/all", (req, res) => res.send("Hey! I am working!"));

// --- Authentication ---
apiRouter.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required." });
    if (!["student", "teacher"].includes(role))
      return res.status(400).json({ message: "Invalid role specified." });

    const [existing] = await dbPool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await dbPool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, password_hash, role],
    );
    res.status(201).json({
      user: { id: result.insertId, name, email, role, is_approved: false },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const [rows] = await dbPool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    if (!user.is_approved)
      return res
        .status(403)
        .json({ message: "Your account is pending approval." });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials." });

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.get("/auth/me", [authMiddleware], async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      "SELECT id, name, email, role, is_approved FROM users WHERE id = ?",
      [req.user.userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });
    res.json({ user: rows[0] });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- Admin Routes ---
apiRouter.get(
  "/admin/users/pending",
  [authMiddleware, adminOnly],
  async (req, res) => {
    try {
      const [users] = await dbPool.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE is_approved = FALSE",
      );
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.patch(
  "/admin/users/:userId/approve",
  [authMiddleware, adminOnly],
  async (req, res) => {
    try {
      const [result] = await dbPool.execute(
        "UPDATE users SET is_approved = TRUE WHERE id = ?",
        [req.params.userId],
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "User not found or already approved." });
      res.json({ message: `User ${req.params.userId} approved successfully.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.get("/admin/users", [authMiddleware, adminOnly], async (req, res) => {
  try {
    const [users] = await dbPool.execute(
      "SELECT id, name, email, role, is_approved FROM users",
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.get(
  "/admin/courses",
  [authMiddleware, adminOnly],
  async (req, res) => {
    try {
      const [courses] = await dbPool.execute(
        "SELECT id, title, description, created_by_user_id FROM courses",
      );
      res.json(courses);
    } catch (error) {
      console.error("Admin Get Courses Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.post("/courses", [authMiddleware, adminOnly], async (req, res) => {
  try {
    const { title, description } = req.body;
    const [result] = await dbPool.execute(
      "INSERT INTO courses (title, description, created_by_user_id) VALUES (?, ?, ?)",
      [title, description, req.user.userId],
    );
    res.status(201).json({ id: result.insertId, title, description });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.delete(
  "/courses/:courseId",
  [authMiddleware, adminOnly],
  async (req, res) => {
    try {
      const [result] = await dbPool.execute(
        "DELETE FROM courses WHERE id = ?",
        [req.params.courseId],
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Course not found." });
      res.json({
        message: `Course ${req.params.courseId} deleted. Cascading deletes handled by DB.`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.delete(
  "/users/:userId",
  [authMiddleware, adminOnly],
  async (req, res) => {
    try {
      const [result] = await dbPool.execute("DELETE FROM users WHERE id = ?", [
        req.params.userId,
      ]);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found." });
      res.json({ message: `User ${req.params.userId} deleted.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// --- Teacher Routes ---
apiRouter.get(
  "/courses/my",
  [authMiddleware, teacherOnly],
  async (req, res) => {
    try {
      const [courses] = await dbPool.execute(
        "SELECT c.* FROM courses c JOIN teachers_courses tc ON c.id = tc.course_id WHERE tc.user_id = ?",
        [req.user.userId],
      );
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.post(
  "/courses/:courseId/tests",
  [authMiddleware, teacherOnly],
  async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!(await isTeacherOfCourse(req.user.userId, courseId)))
        return res
          .status(403)
          .json({ message: "You do not manage this course." });
      const { title } = req.body;
      const [result] = await dbPool.execute(
        "INSERT INTO tests (course_id, created_by_user_id, title) VALUES (?, ?, ?)",
        [courseId, req.user.userId, title],
      );
      res.status(201).json({ id: result.insertId, courseId, title });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// ... (Other teacher routes will follow a similar pattern of checking ownership before acting)
// To keep this concise, I'm fully implementing a few key examples. The rest can be built from these patterns.
apiRouter.put(
  "/tests/:testId",
  [authMiddleware, teacherOnly],
  async (req, res) => {
    try {
      const { testId } = req.params;
      const { title } = req.body;
      const [result] = await dbPool.execute(
        "UPDATE tests SET title = ? WHERE id = ? AND created_by_user_id = ?",
        [title, testId, req.user.userId],
      );
      if (result.affectedRows === 0)
        return res.status(404).json({
          message: "Test not found or you do not have permission to edit it.",
        });
      res.json({ message: `Test ${testId} updated.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.delete(
  "/tests/:testId",
  [authMiddleware, teacherOnly],
  async (req, res) => {
    try {
      const { testId } = req.params;
      const [result] = await dbPool.execute(
        "DELETE FROM tests WHERE id = ? AND created_by_user_id = ?",
        [testId, req.user.userId],
      );
      if (result.affectedRows === 0)
        return res.status(404).json({
          message: "Test not found or you do not have permission to delete it.",
        });
      res.json({ message: `Test ${testId} deleted.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.get(
  "/tests/:testId/questions",
  [authMiddleware, teacherOrAdmin],
  async (req, res) => {
    try {
      const { testId } = req.params;
      const [questions] = await dbPool.execute(
        "SELECT id, question_text, question_type, points FROM questions WHERE test_id = ?",
        [testId],
      );
      res.json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// --- Student Routes ---
apiRouter.get("/courses", [authMiddleware, studentOnly], async (req, res) => {
  try {
    const [courses] = await dbPool.execute(
      "SELECT id, title, description FROM courses",
    );
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRouter.post(
  "/enrollments",
  [authMiddleware, studentOnly],
  async (req, res) => {
    try {
      const { courseId } = req.body;
      await dbPool.execute(
        "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
        [req.user.userId, courseId],
      );
      res.status(201).json({ message: "Enrolled successfully." });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return res
          .status(409)
          .json({ message: "You are already enrolled in this course." });
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.get(
  "/enrollments/my",
  [authMiddleware, studentOnly],
  async (req, res) => {
    try {
      const [courses] = await dbPool.execute(
        "SELECT c.* FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.user_id = ?",
        [req.user.userId],
      );
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.get(
  "/courses/:courseId/details",
  [authMiddleware, studentOnly],
  async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!(await isEnrolledInCourse(req.user.userId, courseId)))
        return res
          .status(403)
          .json({ message: "You must be enrolled to view course details." });

      const [[course]] = await dbPool.execute(
        "SELECT * FROM courses WHERE id = ?",
        [courseId],
      );
      if (!course)
        return res.status(404).json({ message: "Course not found." });

      const [materials] = await dbPool.execute(
        "SELECT id, title, file_type FROM materials WHERE course_id = ?",
        [courseId],
      );
      const [tests] = await dbPool.execute(
        "SELECT id, title FROM tests WHERE course_id = ?",
        [courseId],
      );

      res.json({ ...course, materials, tests });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// --- General/Shared Routes ---
apiRouter.get(
  "/courses/:courseId",
  [authMiddleware, studentOrTeacherOrAdmin],
  async (req, res) => {
    try {
      const [[course]] = await dbPool.execute(
        "SELECT id, title, description FROM courses WHERE id = ?",
        [req.params.courseId],
      );
      if (!course)
        return res.status(404).json({ message: "Course not found." });
      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

apiRouter.get(
  "/materials/:materialId/download",
  [authMiddleware, studentOrTeacherOrAdmin],
  async (req, res) => {
    try {
      const { materialId } = req.params;
      const [[material]] = await dbPool.execute(
        "SELECT course_id, file_path, title FROM materials WHERE id = ?",
        [materialId],
      );
      if (!material)
        return res.status(404).json({ message: "Material not found." });

      let canAccess = false;
      if (req.user.role === "admin") {
        canAccess = true;
      } else if (req.user.role === "teacher") {
        canAccess = await isTeacherOfCourse(
          req.user.userId,
          material.course_id,
        );
      } else if (req.user.role === "student") {
        canAccess = await isEnrolledInCourse(
          req.user.userId,
          material.course_id,
        );
      }

      if (!canAccess)
        return res
          .status(403)
          .json({ message: "You do not have permission to access this file." });

      // In a real app, you would have a dedicated uploads directory.
      // For this example, we'll just send a message. If your files were in an `uploads` folder:
      // const filePath = path.join(__dirname, material.file_path);
      // res.download(filePath);
      res.json({
        message: `Simulating download for ${material.title}. Real path: ${material.file_path}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// --- Fallback for Not Implemented Routes ---
// This catch-all can be useful during development to see which routes are not yet built.
app.use("/api/", (req, res) => {
  res.status(501).json({
    message: `Endpoint ${req.method} ${req.originalUrl} Not Implemented`,
  });
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`\n API Server is running on http://localhost:${PORT}`);
});
