import express from "express";
import cors from "cors";
import fs from "fs";
import { execSync } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// 🤖 AI BLOG GENERATOR (Ollama)
async function generateBlog() {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:1b",
      prompt: `
Write a travel blog about a RANDOM country.

Include:
- Country name
- Visa tips
- Best places to visit
- Travel tips
- Budget idea

Make it SEO friendly and 4–6 paragraphs.
      `,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}

// 💾 SAVE BLOG
function saveBlog(content) {
  if (!fs.existsSync("./blogs")) {
    fs.mkdirSync("./blogs");
  }

  const fileName = `blog-${Date.now()}.html`;

  const html = `
  <html>
  <head><title>AI Travel Blog</title></head>
  <body>
    <h1>AI Travel Blog</h1>
    <p>${content}</p>
  </body>
  </html>
  `;

  fs.writeFileSync(`./blogs/${fileName}`, html);
  console.log("Blog saved:", fileName);
}

// 🚀 PUSH TO GITHUB
function pushGit() {
  try {
    execSync("git add .");
    execSync('git commit -m "auto blog update"');
    execSync("git push");
    console.log("Pushed to GitHub");
  } catch (e) {
    console.log("Git error:", e.message);
  }
}

// 🔁 FULL AUTO RUN
async function runBlog() {
  console.log("Generating blog...");

  const blog = await generateBlog();
  saveBlog(blog);
  pushGit();

  console.log("Done!");
}

// 🌐 manual trigger
app.get("/run", async (req, res) => {
  await runBlog();
  res.send("Blog created!");
});

app.listen(5000, () => {
  console.log("AI Blog Bot running on http://localhost:5000");
});
