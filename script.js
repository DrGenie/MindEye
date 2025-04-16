// Global variables for Discrete Choice Experiment (DCE) and gaze tracking
const questions = [
  "Question 1: Which treatment option do you prefer? (Option A: Rapid onset with higher side effect risk; Option B: Slower onset with fewer side effects)",
  "Question 2: For a new therapy, choose Option A: 50% chance for mood improvement within 2 weeks with a 30% chance of adverse effects, or Option B: 30% chance for improvement in 4 weeks with a 10% chance?",
  "Question 3: Do you value long-term benefits (Option A) more than immediate symptom relief (Option B)?"
];
let currentQuestion = 0;
let responses = [];
let gazeLog = [];
let gazeStartTime = null;

// DCE & gaze UI elements
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

// Dynamic recommendations element
const dynamicRecDiv = document.getElementById("dynamic-rec");

// Initialize Bootstrap tooltips already done in HTML via data attributes

// Start webcam feed
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error("Error accessing webcam:", err); });

// Load first question
function loadQuestion() {
  if (currentQuestion < questions.length) {
    questionText.textContent = questions[currentQuestion];
  } else {
    questionContainer.classList.add("d-none");
    completionDiv.classList.remove("d-none");
    // Automatically compute dynamic recommendations when experiment is finished
    computeDynamicRecommendations();
  }
}

// Event listener for discrete choice buttons
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

// Simulated gaze tracking via mouse move over video container
const videoContainer = document.getElementById("video-container");
videoContainer.addEventListener("mousemove", (event) => {
  const rect = videoContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Draw a red circle as simulated gaze point
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

// Show results and charts when "View Results & Interpretations" button is clicked
showResultsBtn.addEventListener("click", () => {
  // Activate Results tab using Bootstrap's tab system
  const triggerEl = document.querySelector('#results-tab');
  const tab = new bootstrap.Tab(triggerEl);
  tab.show();
  
  // Output raw discrete choice responses
  let respText = "";
  responses.forEach(r => { respText += `${r.timestamp} | ${r.question} -> ${r.choice}\n`; });
  responsesOutput.textContent = respText;
  
  // Output raw gaze data
  let gazeText = "";
  gazeLog.forEach(log => { gazeText += `${log.timestamp} | Time: ${log.time.toFixed(2)}s | X: ${log.x}, Y: ${log.y}\n`; });
  gazeOutput.textContent = gazeText;
  
  // Generate charts for DCE responses and gaze trajectory
  createDCEChart();
  createGazeChart();
  
  // Display static interpretations in layman's language
  displayInterpretations();
});

// Bar chart for discrete choice responses
function createDCEChart() {
  const countA = responses.filter(r => r.choice === "A").length;
  const countB = responses.filter(r => r.choice === "B").length;
  const ctx = document.getElementById('dce-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Option A', 'Option B'],
      datasets: [{
        label: 'Number of Selections',
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

// Line chart for gaze data (X and Y positions over time)
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
        x: { title: { display: true, text: 'Time (s)' } },
        y: { title: { display: true, text: 'Screen Position (pixels)' } }
      }
    }
  });
}

// Display educational interpretations for raw results
function displayInterpretations() {
  const dceInterpretationDiv = document.getElementById("dce-interpretation");
  const gazeInterpretationDiv = document.getElementById("gaze-interpretation");
  
  let dceInterp = "Discrete Choice Responses indicate the following:\n";
  dceInterp += "• Option A selections suggest a preference for rapid treatment onset or long-term benefit despite increased risks.\n";
  dceInterp += "• Option B selections indicate a preference for safer, gentler treatments with fewer side effects.\n";
  dceInterp += "These choices highlight your priorities when considering mental health treatments.";
  
  let gazeInterp = "Gaze Trajectory Analysis:\n";
  gazeInterp += "The chart shows how your gaze (simulated by mouse movement) varied during the experiment.\n";
  gazeInterp += "Steady, focused points suggest careful review, while rapid changes may indicate uncertainty or quick scanning.\n";
  gazeInterp += "Such patterns can help clinicians understand the depth of your information processing.";
  
  dceInterpretationDiv.textContent = dceInterp;
  gazeInterpretationDiv.textContent = gazeInterp;
}

// Simple dynamic recommendations engine based on responses
function computeDynamicRecommendations() {
  let total = responses.length;
  let countA = responses.filter(r => r.choice === "A").length;
  let recText = "";
  if (total === 0) {
    recText = "No responses recorded. Please complete the experiment.";
  } else {
    let ratioA = countA / total;
    if (ratioA >= 0.66) {
      recText = "Recommendation: Your responses indicate a strong preference for rapid treatment or long-term benefits. Consider exploring therapies known for sustained, robust outcomes.";
    } else if (ratioA <= 0.33) {
      recText = "Recommendation: Your responses suggest you favour gentler treatments with fewer side effects. A conservative therapeutic approach may be advisable.";
    } else {
      recText = "Recommendation: Your choices reflect a balanced view. It may be beneficial to discuss options that offer a compromise between immediate relief and long-term benefits.";
    }
  }
  dynamicRecDiv.textContent = recText;
}

// Download full experiment results as a text file
document.getElementById("download-btn").addEventListener("click", () => {
  let output = "Discrete Choice Responses:\n";
  responses.forEach(r => { output += `${r.timestamp} | ${r.question} -> ${r.choice}\n`; });
  output += "\nSimulated Gaze Log:\n";
  gazeLog.forEach(log => { output += `${log.timestamp} | Time: ${log.time.toFixed(2)}s | X: ${log.x}, Y: ${log.y}\n`; });
  
  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mindeye_full_results.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize experiment by loading the first question
loadQuestion();
