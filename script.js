// script.js

// Global variables for Chart.js instances
let linearChartInstance;
let quadraticChartInstance;

// --- Helper Functions ---
/**
 * Displays an error message in a specified result div.
 * @param {string} resultDivId - The ID of the div to display the error.
 * @param {string} message - The error message.
 */
function displayError(resultDivId, message) {
    const resultDiv = document.getElementById(resultDivId);
    resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
    // Also clear other specific result spans
    if (resultDivId.includes('linear')) {
        document.getElementById('linear_function_display').textContent = '';
        document.getElementById('linear_domain').textContent = '';
        document.getElementById('linear_range').textContent = '';
        document.getElementById('linear_solution_text').textContent = '';
        if (linearChartInstance) linearChartInstance.destroy();
    } else {
        document.getElementById('quadratic_function_display').textContent = '';
        document.getElementById('quadratic_domain').textContent = '';
        document.getElementById('quadratic_range').textContent = '';
        document.getElementById('quadratic_vertex').textContent = '';
        document.getElementById('quadratic_solution_text').textContent = '';
        if (quadraticChartInstance) quadraticChartInstance.destroy();
    }
}

/**
 * Updates the display elements for results.
 * @param {string} prefix - 'linear' or 'quadratic'.
 * @param {object} data - Object containing display data (function, domain, range, solution, vertex).
 */
function updateResultDisplay(prefix, data) {
    document.getElementById(`${prefix}_function_display`).textContent = data.functionDisplay;
    document.getElementById(`${prefix}_domain`).textContent = data.domain;
    document.getElementById(`${prefix}_range`).textContent = data.range;
    document.getElementById(`${prefix}_solution_text`).textContent = data.solution;
    if (prefix === 'quadratic') {
        document.getElementById('quadratic_vertex').textContent = data.vertex;
    }
}

/**
 * Prepares and renders a chart using Chart.js.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {object} chartData - Data for the chart.
 * @param {object} chartOptions - Options for the chart.
 * @param {Chart} currentChartInstance - The current chart instance to destroy before creating a new one.
 * @returns {Chart} - The new chart instance.
 */
function renderChart(canvasId, chartData, chartOptions, currentChartInstance) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (currentChartInstance) {
        currentChartInstance.destroy(); // Destroy previous chart to prevent memory leaks/overlaps
    }
    return new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

/**
 * Speaks the text content of a given element ID.
 * @param {string} elementId - The ID of the element whose text content should be spoken.
 */
function speakResult(elementId) {
    if ('speechSynthesis' in window) {
        const textToSpeak = document.getElementById(elementId).textContent;
        if (textToSpeak.trim() === '' || textToSpeak.includes('Error')) {
            alert('No hay solución para leer o hay un error. Por favor, resuelve primero.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'es-ES'; // Set language to Spanish
        utterance.pitch = 1; // Standard pitch
        utterance.rate = 1; // Standard speaking rate

        // Optionally, select a specific voice if available (uncomment and test)
        // const voices = window.speechSynthesis.getVoices();
        // const spanishVoice = voices.find(voice => voice.lang === 'es-ES' || voice.lang === 'es_ES');
        // if (spanishVoice) {
        //     utterance.voice = spanishVoice;
        // }

        speechSynthesis.speak(utterance);
    } else {
        alert('Lo siento, tu navegador no soporta la síntesis de voz.');
    }
}


// --- Linear Function Solver ---
function solveLinear() {
    const a = parseFloat(document.getElementById('linear_a').value);
    const b = parseFloat(document.getElementById('linear_b').value);
    const op = document.getElementById('linear_op').value;
    const resultDisplayId = 'linear_result';

    if (isNaN(a) || isNaN(b)) {
        displayError(resultDisplayId, 'Por favor, introduce valores numéricos válidos para a y b.');
        return;
    }

    let solutionText = '';
    let domainText = 'x ∈ ℝ (Todos los números reales)';
    let rangeText = 'y ∈ ℝ (Todos los números reales)';
    let functionDisplay = `f(x) = ${a}x + ${b}`;

    // Update function display immediately
    document.getElementById('linear_function_display').textContent = functionDisplay;

    if (a === 0) {
        // Case 0x + b OP 0 => b OP 0
        if (op === 'eq') { // 0 = 0 (infinite solutions) or b = 0
            if (b === 0) {
                solutionText = 'Todos los números reales (x ∈ ℝ)';
            } else {
                solutionText = 'No hay solución (∅)';
            }
        } else if (op === 'gt') { // b > 0
            solutionText = (b > 0) ? 'Todos los números reales (x ∈ ℝ)' : 'No hay solución (∅)';
        } else if (op === 'lt') { // b < 0
            solutionText = (b < 0) ? 'Todos los números reales (x ∈ ℝ)' : 'No hay solución (∅)';
        } else if (op === 'ge') { // b >= 0
            solutionText = (b >= 0) ? 'Todos los números reales (x ∈ ℝ)' : 'No hay solución (∅)';
        } else if (op === 'le') { // b <= 0
            solutionText = (b <= 0) ? 'Todos los números reales (x ∈ ℝ)' : 'No hay solución (∅)';
        }
        rangeText = `y = ${b}`; // Range is just the constant b for a horizontal line
    } else {
        // Standard linear equation/inequality
        const x_val = -b / a;
        if (op === 'eq') {
            solutionText = `x = ${x_val.toFixed(2)}`;
        } else if (a > 0) {
            if (op === 'gt') solutionText = `x > ${x_val.toFixed(2)}`;
            else if (op === 'lt') solutionText = `x < ${x_val.toFixed(2)}`;
            else if (op === 'ge') solutionText = `x ≥ ${x_val.toFixed(2)}`;
            else if (op === 'le') solutionText = `x ≤ ${x_val.toFixed(2)}`;
        } else { // a < 0, inequality sign flips
            if (op === 'gt') solutionText = `x < ${x_val.toFixed(2)}`;
            else if (op === 'lt') solutionText = `x > ${x_val.toFixed(2)}`;
            else if (op === 'ge') solutionText = `x ≤ ${x_val.toFixed(2)}`;
            else if (op === 'le') solutionText = `x ≥ ${x_val.toFixed(2)}`;
        }
    }

    // Update display
    updateResultDisplay('linear', {
        functionDisplay: functionDisplay,
        domain: domainText,
        range: rangeText,
        solution: solutionText
    });

    // --- Graphing Linear Function ---
    const dataPoints = [];
    const xRange = 10;
    const step = 0.5;

    for (let x = -xRange; x <= xRange; x += step) {
        let y = a * x + b;
        dataPoints.push({ x: x, y: y });
    }

    const chartData = {
        datasets: [{
            label: functionDisplay,
            data: dataPoints,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: { display: true, text: 'x' },
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            },
            y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'y' },
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                    }
                }
            }
        }
    };

    linearChartInstance = renderChart('linearChart', chartData, chartOptions, linearChartInstance);
}

// --- Quadratic Function Solver ---
function solveQuadratic() {
    const a = parseFloat(document.getElementById('quadratic_a').value);
    const b = parseFloat(document.getElementById('quadratic_b').value);
    const c = parseFloat(document.getElementById('quadratic_c').value);
    const op = document.getElementById('quadratic_op').value;
    const resultDisplayId = 'quadratic_result';

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        displayError(resultDisplayId, 'Por favor, introduce valores numéricos válidos para a, b y c.');
        return;
    }

    if (a === 0) {
        displayError(resultDisplayId, 'Si a=0, esto no es una función cuadrática. Por favor, usa el solucionador lineal.');
        return;
    }

    let solutionText = '';
    let domainText = 'x ∈ ℝ (Todos los números reales)';
    let rangeText = '';
    let vertexText = '';
    let functionDisplay = `f(x) = ${a}x² + ${b}x + ${c}`;

    // Update function display immediately
    document.getElementById('quadratic_function_display').textContent = functionDisplay;

    const delta = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;

    vertexText = `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`;

    if (a > 0) { // Parabola opens upwards
        rangeText = `y ∈ [${vertexY.toFixed(2)}, ∞)`;
    } else { // Parabola opens downwards (a < 0)
        rangeText = `y ∈ (-∞, ${vertexY.toFixed(2)}]`;
    }

    // --- Solving Equation/Inequality ---
    if (op === 'eq') {
        if (delta > 0) {
            const root1 = (-b - Math.sqrt(delta)) / (2 * a);
            const root2 = (-b + Math.sqrt(delta)) / (2 * a);
            solutionText = `x₁ = ${root1.toFixed(2)}, x₂ = ${root2.toFixed(2)}`;
        } else if (delta === 0) {
            const root = -b / (2 * a);
            solutionText = `x = ${root.toFixed(2)} (raíz doble)`;
        } else { // delta < 0
            const realPart = (-b / (2 * a)).toFixed(2);
            const imagPart = (Math.sqrt(Math.abs(delta)) / (2 * a)).toFixed(2);
            solutionText = `No hay solución real. Raíces complejas: ${realPart} ± ${imagPart}i`;
        }
    } else {
        // Solving Inequality
        if (delta >= 0) {
            const root1_val = (-b - Math.sqrt(delta)) / (2 * a);
            const root2_val = (-b + Math.sqrt(delta)) / (2 * a);

            const r1 = Math.min(root1_val, root2_val);
            const r2 = Math.max(root1_val, root2_val);

            if (delta === 0) {
                // One real root (parabola touches x-axis at one point)
                if (a > 0) { // Parabola opens upwards
                    if (op === 'gt') solutionText = `x ∈ ℝ, excepto x = ${r1.toFixed(2)}`;
                    else if (op === 'ge') solutionText = `x ∈ ℝ`;
                    else if (op === 'lt' || op === 'le') solutionText = `No hay solución (∅)${op === 'le' ? ` o solo x = ${r1.toFixed(2)}` : ''}`;
                } else { // Parabola opens downwards (a < 0)
                    if (op === 'lt') solutionText = `x ∈ ℝ, excepto x = ${r1.toFixed(2)}`;
                    else if (op === 'le') solutionText = `x ∈ ℝ`;
                    else if (op === 'gt' || op === 'ge') solutionText = `No hay solución (∅)${op === 'ge' ? ` o solo x = ${r1.toFixed(2)}` : ''}`;
                }
            } else {
                // Two distinct real roots
                if (a > 0) { // Parabola opens upwards
                    if (op === 'gt') solutionText = `x < ${r1.toFixed(2)} o x > ${r2.toFixed(2)}`;
                    else if (op === 'lt') solutionText = `${r1.toFixed(2)} < x < ${r2.toFixed(2)}`;
                    else if (op === 'ge') solutionText = `x ≤ ${r1.toFixed(2)} o x ≥ ${r2.toFixed(2)}`;
                    else if (op === 'le') solutionText = `${r1.toFixed(2)} ≤ x ≤ ${r2.toFixed(2)}`;
                } else { // Parabola opens downwards (a < 0)
                    if (op === 'gt') solutionText = `${r1.toFixed(2)} < x < ${r2.toFixed(2)}`;
                    else if (op === 'lt') solutionText = `x < ${r1.toFixed(2)} o x > ${r2.toFixed(2)}`;
                    else if (op === 'ge') solutionText = `${r1.toFixed(2)} ≤ x ≤ ${r2.toFixed(2)}`;
                    else if (op === 'le') solutionText = `x ≤ ${r1.toFixed(2)} o x ≥ ${r2.toFixed(2)}`;
                }
            }
        } else {
            // Complex roots (parabola never crosses x-axis)
            if (a > 0) { // Parabola opens upwards, always above x-axis
                if (op === 'gt' || op === 'ge') solutionText = 'Todos los números reales (x ∈ ℝ)';
                else if (op === 'lt' || op === 'le') solutionText = 'No hay solución (∅)';
            } else { // Parabola opens downwards, always below x-axis
                if (op === 'lt' || op === 'le') solutionText = 'Todos los números reales (x ∈ ℝ)';
                else if (op === 'gt' || op === 'ge') solutionText = 'No hay solución (∅)';
            }
        }
    }

    // Update display
    updateResultDisplay('quadratic', {
        functionDisplay: functionDisplay,
        domain: domainText,
        range: rangeText,
        vertex: vertexText,
        solution: solutionText
    });

    // --- Graphing Quadratic Function ---
    const dataPoints = [];
    const xRange = 10;
    const step = 0.1;

    for (let x = -xRange; x <= xRange; x += step) {
        let y = a * Math.pow(x, 2) + b * x + c;
        dataPoints.push({ x: x, y: y });
    }

    // Add vertex to data points for accurate plotting and tooltip
    if (vertexX >= -xRange && vertexX <= xRange) {
        dataPoints.push({ x: vertexX, y: vertexY });
    }
    dataPoints.sort((p1, p2) => p1.x - p2.x); // Sort by x-value

    const rootsData = [];
    if (op === 'eq' && delta >= 0) {
        const root1 = (-b - Math.sqrt(delta)) / (2 * a);
        const root2 = (-b + Math.sqrt(delta)) / (2 * a);
        rootsData.push({ x: root1, y: 0 });
        if (delta !== 0) { // Add second root if distinct
            rootsData.push({ x: root2, y: 0 });
        }
    }

    const chartData = {
        datasets: [{
            label: functionDisplay,
            data: dataPoints,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.1
        }, {
            label: 'Vértice',
            data: [{ x: vertexX, y: vertexY }],
            borderColor: 'red',
            backgroundColor: 'red',
            pointRadius: 5,
            pointStyle: 'circle',
            showLine: false
        }].concat(rootsData.length > 0 ? [{
            label: 'Raíces',
            data: rootsData,
            borderColor: 'blue',
            backgroundColor: 'blue',
            pointRadius: 5,
            pointStyle: 'cross',
            showLine: false
        }] : []) // Conditionally add roots dataset
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: { display: true, text: 'x' },
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            },
            y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'y' },
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                    }
                }
            }
        }
    };

    quadraticChartInstance = renderChart('quadraticChart', chartData, chartOptions, quadraticChartInstance);
}

// Initial calculation on page load for default values
window.onload = function() {
    solveLinear();
    solveQuadratic();
};
