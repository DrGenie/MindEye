// Global variables for DCE experiment and gaze log
const questions = [
  "Question 1: Which treatment option do you prefer?",
  "Question 2: Do you prefer a faster onset with higher side effects (Option A) or a slower onset with fewer side effects (Option B)?",
  "Question 3: Do you value long-term benefits more than short-term comfort?"
];
let currentQuestion = 0;
let responses = [];
let gazeLog = [];

// Set up discrete choice experiment interface
const questionText = document.getElementById("question-text");
const buttons = document.querySelectorAll(".choice-btn");
const questionContainer = document.getElementById("question-container");
const completionDiv = document.getElementById("completion");
const downloadBtn = document.getElementById("download-btn");

// Set up video and canvas for eye tracking simulation
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const gazeInfo = document.getElementById("gaze-info");
const overlayCtx = overlay.getContext("2d");

// Adjust canvas size to video dimensions
overlay.width = 640;
overlay.height = 480;

// Start webcam video
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing webcam: ", err);
  });

// Function to update question text
function loadQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    questionContainer.classList.add("hidden");
    completionDiv.classList.remove("hidden");
  }
}

// Log response when a button is clicked
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.getAttribute("data-choice");
    const timestamp = new Date().toISOString();
    responses.push({
      question: questions[currentQuestion],
      choice: choice,
      timestamp: timestamp
    });
    currentQuestion++;
    loadQuestion();
  });
});

// Capture mouse move events over the video container to simulate gaze
const videoContainer = document.getElementById("video-container");
videoContainer.addEventListener("mousemove", (event) => {
  // Calculate relative mouse position within video container
  const rect = videoContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Draw a circle representing the "gaze point" on the overlay
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  overlayCtx.beginPath();
  overlayCtx.arc(x, y, 10, 0, 2 * Math.PI);
  overlayCtx.fillStyle = "rgba(255, 0, 0, 0.6)";
  overlayCtx.fill();
  
  // Log gaze data with a timestamp
  gazeLog.push({
    timestamp: new Date().toISOString(),
    x: x,
    y: y
  });
  
  gazeInfo.textContent = `Simulated Gaze: X = ${x.toFixed(0)}, Y = ${y.toFixed(0)}`;
});

// Function to download results as a text file
downloadBtn.addEventListener("click", () => {
  let output = "Discrete Choice Responses:\n";
  responses.forEach(r => {
    output += `${r.timestamp} | ${r.question} -> ${r.choice}\n`;
  });
  output += "\nSimulated Gaze Log:\n";
  gazeLog.forEach(log => {
    output += `${log.timestamp} | X: ${log.x.toFixed(0)}, Y: ${log.y.toFixed(0)}\n`;
  });

  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "experiment_results.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Load the first question on page load
loadQuestion();
