/* MindEye Demo Script for Hybrid Clinical Assessment Demo */

// Sample discrete choice questions with mental health context
const questions = [
  "Question 1: Which treatment option do you prefer? (Option A: Rapid onset with higher side effect risk; Option B: Slower onset with minimal side effects)",
  "Question 2: For a new therapy, do you choose Option A: A 50% chance for mood improvement within 2 weeks with a 30% risk of adverse effects, or Option B: A 30% chance for improvement in 4 weeks with only a 10% risk?",
  "Question 3: When considering treatment outcomes, do you value long-term benefits (Option A) more than immediate symptom relief (Option B)?"
];
let currentQuestion = 0;
let responses = [];
let gazeLog = [];

// Record start time for gaze log relative timing
let gazeStartTime = null;

// DCE UI elements
const questionText = document.getElementById("question-text");
const choiceButtons = document.querySelectorAll(".choice-btn");
const questionContainer = document.getElementById("question-container");
const completionDiv = document.getElementById("completion");
const showResultsBtn = document.getElementById("show-results-btn");

// Video & Canvas for gaze simulation
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");
const gazeInfo = document.getElementById("gaze-info");

// Results section elements
const resultsSection = document.getElementById("results-section");
const responsesOutput = document.getElementById("responses-output");
const gazeOutput = document.getElementById("gaze-output");
const downloadBtn = document.getElementById("download-btn");

// Set canvas size to match video dimensions
overlay.width = 640;
overlay.height = 480;

// Start webcam feed
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error("Error accessing webcam:", err); });

// Function to load current question
function loadQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    questionContainer.classList.add("hidden");
    completionDiv.classList.remove("hidden");
  }
}

// Event listeners for choice buttons
choiceButtons.forEach(btn => {
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

// Simulate eye-tracking via mouse movements over the video container
const videoContainer = document.getElementById("video-container");
videoContainer.addEventListener("mousemove", (event) => {
  const rect = videoContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Draw a red circle at the current mouse position (gaze simulation)
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  overlayCtx.beginPath();
  overlayCtx.arc(x, y, 10, 0, 2 * Math.PI);
  overlayCtx.fillStyle = "rgba(255, 0, 0, 0.6)";
  overlayCtx.fill();
  
  if (!gazeStartTime) { gazeStartTime = Date.now(); }
  const relativeTime = (Date.now() - gazeStartTime) / 1000;
  
  gazeLog.push({
    timestamp: new Date().toISOString(),
    time: relativeTime,
    x: x,
    y: y
  });
  
  gazeInfo.textContent = `Simulated Gaze: X = ${x.toFixed(0)}, Y = ${y.toFixed(0)}`;
});

// Show results and generate plots when user clicks "Show Results"
showResultsBtn.addEventListener("click", () => {
  document.getElementById("dce-section").classList.add("hidden");
  resultsSection.classList.remove("hidden");
  
  // Output raw discrete choice responses
  let respText = "";
  responses.forEach(r => {
    respText += `${r.timestamp} | ${r.question} -> ${r.choice}\n`;
  });
  responsesOutput.textContent = respText;
  
  // Output raw gaze log data
  let gazeText = "";
  gazeLog.forEach(log => {
    gazeText += `${log.timestamp} | Time: ${log.time.toFixed(2)}s | X: ${log.x}, Y: ${log.y}\n`;
  });
  gazeOutput.textContent = gazeText;
  
  // Generate charts with Chart.js
  createDCEChart();
  createGazeChart();
  
  // Display educational interpretations
  displayInterpretations();
});

// Create a bar chart summarising discrete choice responses
function createDCEChart() {
  let countA = responses.filter(r => r.choice === "A").length;
  let countB = responses.filter(r => r.choice === "B").length;
  const ctx = document.getElementById('dce-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Option A', 'Option B'],
      datasets: [{
        label: 'Number of Responses',
        data: [countA, countB],
        backgroundColor: ['rgba(0, 120, 212, 0.6)', 'rgba(0, 150, 136, 0.6)'],
        borderColor: ['rgba(0, 120, 212, 1)', 'rgba(0, 150, 136, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, precision: 0 } }
    }
  });
}

// Create a line chart for the gaze trajectory (X and Y positions over time)
function createGazeChart() {
  // Extract time, x, and y values from gazeLog
  const times = gazeLog.map(log => log.time.toFixed(2));
  const xValues = gazeLog.map(log => log.x);
  const yValues = gazeLog.map(log => log.y);
  
  const ctx = document.getElementById('gaze-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Gaze X Position',
          data: xValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Gaze Y Position',
          data: yValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          title: { display: true, text: 'Time (s)' }
        },
        y: {
          title: { display: true, text: 'Screen Position (pixels)' }
        }
      }
    }
  });
}

// Provide educational interpretations for both DCE and gaze results
function displayInterpretations() {
  const dceInterpretationDiv = document.getElementById("dce-interpretation");
  const gazeInterpretationDiv = document.getElementById("gaze-interpretation");
  
  const dceInterp = "Interpretation of Discrete Choice Responses:\n" +
    "• For Question 1, the participant chose Option A indicating a preference for rapid treatment onset despite potential higher side effects.\n" +
    "• For Question 2, a selection of Option B suggests an inclination toward a more cautious approach with fewer side effects.\n" +
    "• For Question 3, opting for Option A again reflects a priority for long-term benefits.\n\n" +
    "These responses demonstrate a nuanced decision-making process, balancing immediacy, risk and sustainability in treatment.";
  
  const gazeInterp = "Interpretation of Gaze Log Trajectory:\n" +
    "The line chart shows the movement of the simulated gaze over time. Early in the task, rapid changes in X and Y positions may indicate initial scanning of the treatment options. Subsequently, more stable fixations suggest periods of focused evaluation.\n" +
    "Such patterns can help identify which attributes capture the participant’s attention and may correlate with their decision certainty or hesitation.";
  
  dceInterpretationDiv.textContent = dceInterp;
  gazeInterpretationDiv.textContent = gazeInterp;
}

// Download full results as a text file
downloadBtn.addEventListener("click", () => {
  let output = "Discrete Choice Responses:\n";
  responses.forEach(r => {
    output += `${r.timestamp} | ${r.question} -> ${r.choice}\n`;
  });
  output += "\nSimulated Gaze Log:\n";
  gazeLog.forEach(log => {
    output += `${log.timestamp} | Time: ${log.time.toFixed(2)}s | X: ${log.x}, Y: ${log.y}\n`;
  });
  
  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "experiment_full_results.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize the experiment by loading the first question
loadQuestion();
