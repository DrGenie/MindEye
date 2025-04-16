// Global variables for DCE and gaze tracking
const questions = [
  "Question 1: Which treatment option do you prefer? (Option A: Rapid onset with higher side effect risk; Option B: Slower onset with minimal side effects)",
  "Question 2: For a new therapy, choose Option A: 50% chance for mood improvement within 2 weeks with a 30% risk of adverse effects, or Option B: 30% chance for improvement in 4 weeks with only a 10% risk.",
  "Question 3: Do you value long-term benefits (Option A) more than immediate symptom relief (Option B)?"
];
let currentQuestion = 0;
let responses = [];
let gazeLog = [];
let gazeStartTime = null;

// Elements for DCE experiment and gaze simulation
const questionText = document.getElementById("question-text");
const choiceButtons = document.querySelectorAll(".choice-btn");
const questionContainer = document.getElementById("question-container");
const completionDiv = document.getElementById("completion");
const showResultsBtn = document.getElementById("show-results-btn");

const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");
const gazeInfo = document.getElementById("gaze-info");

// Results elements
const responsesOutput = document.getElementById("responses-output");
const gazeOutput = document.getElementById("gaze-output");

// Set canvas size
overlay.width = 640;
overlay.height = 480;

// Tab navigation controls
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class
    tabs.forEach(b => b.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));
    // Add active class to selected tab
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Start webcam video
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing webcam:", err);
  });

// Load current DCE question
function loadQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    questionContainer.classList.add("hidden");
    completionDiv.classList.remove("hidden");
  }
}

// Record discrete choice responses
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

// Simulated gaze tracking using mouse movement over video container
const videoContainer = document.getElementById("video-container");
videoContainer.addEventListener("mousemove", (event) => {
  const rect = videoContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Draw gaze point as red circle
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  overlayCtx.beginPath();
  overlayCtx.arc(x, y, 10, 0, 2 * Math.PI);
  overlayCtx.fillStyle = "rgba(255, 0, 0, 0.6)";
  overlayCtx.fill();
  
  if (!gazeStartTime) {
    gazeStartTime = Date.now();
  }
  
  const relativeTime = (Date.now() - gazeStartTime) / 1000;
  gazeLog.push({
    timestamp: new Date().toISOString(),
    time: relativeTime,
    x: x,
    y: y
  });
  
  gazeInfo.textContent = `Simulated Gaze: X = ${x.toFixed(0)}, Y = ${y.toFixed(0)}`;
});

// Show results and generate plots once the experiment is complete
showResultsBtn.addEventListener("click", () => {
  // Hide experiment tab and switch to Results tab
  document.getElementById("experiment").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
  
  // Output discrete choice responses in a preformatted block
  let respText = "";
  responses.forEach(r => {
    respText += `${r.timestamp} | ${r.question} -> ${r.choice}\n`;
  });
  responsesOutput.textContent = respText;
  
  // Output gaze log data
  let gazeText = "";
  gazeLog.forEach(log => {
    gazeText += `${log.timestamp} | Time: ${log.time.toFixed(2)}s | X: ${log.x}, Y: ${log.y}\n`;
  });
  gazeOutput.textContent = gazeText;
  
  // Create charts for DCE responses and gaze data
  createDCEChart();
  createGazeChart();
  
  // Show interpretations in the Results tab (layman explanations)
  displayInterpretations();
});

// Create a bar chart for discrete choice responses using Chart.js
function createDCEChart() {
  const countA = responses.filter(r => r.choice === "A").length;
  const countB = responses.filter(r => r.choice === "B").length;
  const ctx = document.getElementById('dce-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Option A', 'Option B'],
      datasets: [{
        label: 'Number of Responses',
        data: [countA, countB],
        backgroundColor: ['rgba(0, 120, 212, 0.7)', 'rgba(0, 150, 136, 0.7)'],
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

// Create a line chart for gaze trajectory using Chart.js
function createGazeChart() {
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

// Provide layman educational interpretations for results and policy implications
function displayInterpretations() {
  const dceInterpretationDiv = document.getElementById("dce-interpretation");
  const gazeInterpretationDiv = document.getElementById("gaze-interpretation");
  
  let dceInterp = "Interpretation of Discrete Choice Responses:\n";
  dceInterp += "• A choice of Option A indicates a preference for rapid treatment or long-term benefit despite higher risks.\n";
  dceInterp += "• A choice of Option B suggests a desire for a gentler approach with fewer side effects, even if results are slower.\n";
  dceInterp += "Your selections reflect your personal priorities when evaluating mental health treatments.";
  
  let gazeInterp = "Interpretation of Gaze Trajectory:\n";
  gazeInterp += "Your simulated gaze data (tracked via mouse movement) shows how steadily or erratically you view the treatment options.\n";
  gazeInterp += "Periods with stable (less fluctuating) positions may indicate focused attention and confidence, while rapid movements suggest exploration or uncertainty.\n";
  gazeInterp += "Clinicians can use such insights to understand how engaged you are with the information provided.";
  
  dceInterpretationDiv.textContent = dceInterp;
  gazeInterpretationDiv.textContent = gazeInterp;
}

// Download full experiment results as a text file
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
  a.download = "mindeye_experiment_results.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize the experiment by loading the first question
loadQuestion();
