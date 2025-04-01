import express from "express";

const app = express();
const port = 8080;

// Add this line to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  const body = req.body;
  // Remove console.log(req) as it's too verbose
  if(body && body.name) {
    res.send(`Hello ${body.name}!`);
    return; // Add return to prevent multiple responses
  }
  res.send("Hello stranger!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});