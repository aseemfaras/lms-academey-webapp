// Hard-coded session data for each course.
// Each session represents one date/recording with its own video and notes.

export const courseSessionsById = {
  1: [
    {
      id: "1-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "Python Backend – Introduction and Setup",
      videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
      notes: [
        "Overview of Python as a backend language.",
        "Environment setup: Python, virtualenv, and basic tooling.",
        "Introduction to REST APIs and backend architecture.",
        "Folder structure for a typical backend project."
      ]
    },
    {
      id: "1-2026-02-02",
      dateLabel: "02 Feb 2026",
      title: "Working with APIs and Routing",
      videoUrl: "https://www.youtube.com/embed/UsAQrNv8wCk",
      notes: [
        "URL routing patterns and views.",
        "Handling GET/POST requests.",
        "Basic error handling and status codes."
      ]
    },
    {
      id: "1-2026-02-03",
      dateLabel: "03 Feb 2026",
      title: "Database Models and ORM Basics",
      videoUrl: "https://www.youtube.com/embed/8qEnExGLZfY",
      notes: [
        "Defining models for courses and users.",
        "Migrations and schema evolution.",
        "Basic CRUD operations via ORM."
      ]
    }
  ],
  2: [
    {
      id: "2-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "React JS – Fundamentals",
      videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
      notes: [
        "What is React and why it is used.",
        "Components, props, and JSX.",
        "Rendering lists and basic event handling."
      ]
    },
    {
      id: "2-2026-02-02",
      dateLabel: "02 Feb 2026",
      title: "State Management with Hooks",
      videoUrl: "https://www.youtube.com/embed/9U3IhLAnSxM",
      notes: [
        "useState and useEffect basics.",
        "Lifting state up between components.",
        "Simple patterns for forms and inputs."
      ]
    }
  ],
  3: [
    {
      id: "3-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "JavaScript Advanced – ES6+ Review",
      videoUrl: "https://www.youtube.com/embed/NCwa_xi0Uuc",
      notes: [
        "let/const, arrow functions, template literals.",
        "Destructuring and spread/rest operators.",
        "Modules and imports/exports."
      ]
    }
  ],
  4: [
    {
      id: "4-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "Node.js Backend – Introduction",
      videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
      notes: [
        "What is Node.js and when to use it.",
        "NPM, package.json, and basic scripts.",
        "Creating a simple HTTP server."
      ]
    }
  ],
  5: [
    {
      id: "5-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "Data Analysis – Getting Started",
      videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8",
      notes: [
        "Understanding the role of a data analyst.",
        "Overview of tools: Excel, Python, SQL.",
        "Loading and exploring datasets."
      ]
    },
    {
      id: "5-2026-02-02",
      dateLabel: "02 Feb 2026",
      title: "Data Cleaning and Preparation",
      videoUrl: "https://www.youtube.com/embed/5OnWrK0eO2Q",
      notes: [
        "Handling missing values and outliers.",
        "Basic transformations and feature engineering.",
        "Documenting assumptions and decisions."
      ]
    }
  ],
  6: [
    {
      id: "6-2026-02-01",
      dateLabel: "01 Feb 2026",
      title: "Java Backend – Introduction",
      videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      notes: [
        "Java as a backend language.",
        "Project structure and build tools.",
        "First REST endpoint."
      ]
    }
  ]
};

export function getSessionsForCourse(courseId) {
  return courseSessionsById[courseId] || [];
}

