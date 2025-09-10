const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const app = express();

// Security Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// Serve uploaded files so admin can open document links
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://HEHIPEDS:HEHIPEDS@heritageuniversitydb.tpryiam.mongodb.net/?retryWrites=true&w=majority&appName=HeritageUniversityDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// File Upload Setup
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")
    );
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed.")
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// MongoDB Schema for Applicants
const applicantSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  pob: String,
  region: String,
  sex: String,
  email: String,
  phone: String,
  birthCertificate: String,
  idCard: String,
  AlevelCertificate: String,
  program: String,
});
const Applicant = mongoose.model("Applicant", applicantSchema);

// Session middleware (add after other middleware)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "heritageSecret2025",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false }, // set secure: true if using HTTPS
  })
);

// Routes
app.get("/apply", (req, res) => {
  res.render("apply");
});

app.post(
  "/apply",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "AlevelCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Basic validation and sanitization
      const { program, sex } = req.body;
      const firstName = (req.body["First Name"] || "").trim();
      const middleName = (req.body["Middle Name"] || "").trim();
      const lastName = (req.body["Last Name"] || "").trim();
      const dob = (req.body["Date of birth"] || "").trim();
      const pob = (req.body["Place of birth"] || "").trim();
      const region = (req.body["Region of origin"] || "").trim();
      const email = (req.body["E-Mail"] || "").trim();
      const phone = (req.body["Telephone"] || "").trim();

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !dob ||
        !pob ||
        !region ||
        !sex ||
        !email ||
        !phone
      ) {
        return res.status(400).send("All fields are required.");
      }
      // Validate email format
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).send("Invalid email format.");
      }
      // Validate phone format (basic)
      if (!/^\d{8,15}$/.test(phone)) {
        return res.status(400).send("Invalid phone number.");
      }

      // File paths
      const documents = {
        birthCertificate: req.files["birthCertificate"]
          ? req.files["birthCertificate"][0].path
          : null,
        idCard: req.files["idCard"] ? req.files["idCard"][0].path : null,
        AlevelCertificate: req.files["AlevelCertificate"]
          ? req.files["AlevelCertificate"][0].path
          : null,
      };

      // Save to DB
      const applicant = new Applicant({
        firstName,
        middleName,
        lastName,
        dob,
        pob,
        region,
        sex,
        email,
        phone,
        ...documents,
        program: program || "",
      });
      await applicant.save();
      res.send("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      res.status(500).send(`Error submitting application: ${err.message}`);
    }
  }
);

// Admin login GET
app.get("/admin/login", (req, res) => {
  res.render("admin-login", { error: null });
});

// Admin login POST
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  // Replace with real user lookup in production!
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "heritage2025";
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.redirect("/admin/applications");
  } else {
    res.render("admin-login", { error: "Invalid username or password." });
  }
});

// Secure admin route
function adminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

app.get("/admin/applications", adminAuth, async (req, res) => {
  try {
    const applications = await Applicant.find().sort({ _id: -1 });
    res.render("admin-applications", { applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).send(`Error fetching applications: ${err.message}`);
  }
});

// Admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
