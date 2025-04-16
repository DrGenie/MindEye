# MindEye – Hybrid Clinical Assessment Demo

This repository contains a demo web application for **MindEye**, a hybrid clinical assessment tool that integrates AI, eye-tracking, and behavioural modelling (via discrete choice experiments) for mental health care.

## Features
- **Responsive UI:** Built using Bootstrap for desktop and mobile responsiveness.
- **Multi-tab Interface:** Tabs include Introduction, Instructions, Experiment, Results, Policy Meaning, and Dynamic Recommendations.
- **Simulated Eye-Tracking:** Uses mouse movements over the video area as a proxy for eye-tracking.
- **Realistic DCE Examples:** Contains mental health treatment trade-off questions.
- **Data Visualisation:** Uses Chart.js to display bar charts (for DCE responses) and line charts (for gaze trajectory).
- **Dynamic Recommendations Engine:** A simple rules-based engine provides tailored treatment suggestions.
- **Downloadable Reports:** Ability to download the full experiment results as a text file.

## How to Run
1. Clone or download this repository.
2. Open `index.html` in your web browser.
3. Allow access to your webcam when prompted.
4. Navigate through the tabs using the top navigation menu.
5. Complete the experiment by responding to the discrete choice questions.
6. Click on "View Results & Interpretations" to see charts and dynamic recommendations.
7. Use the "Download Full Results" button to save the output as a text file.

## Extending the Demo
- **Eye-Tracking:** For a production version, consider integrating [WebGazer.js](https://webgazer.cs.brown.edu/) for real webcam-based gaze tracking.
- **Dynamic Recommendations:** Enhance the rules-based engine or integrate machine-learning models to provide more refined recommendations.
- **Data Persistence:** Implement a backend service to store and analyse data.
- **Regulatory & Commercialisation:** Use this demo as a proof-of-concept for further development under grant proposals such as the NSW Medical Devices Fund.

## License
This project is provided for demonstration purposes. See the LICENSE file for details.

## Contact
For questions or suggestions, please contact [your-email@example.com].
