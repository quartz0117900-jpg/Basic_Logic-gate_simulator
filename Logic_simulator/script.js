const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentMode = "AND"; 

// Switch Data
let switchA = { x: 50, y: 100, w: 100, h: 60, isOn: false, label: "Switch A" };
let switchB = { x: 50, y: 250, w: 100, h: 60, isOn: false, label: "Switch B" };

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- 1. THE LOGIC ---
    let bulbOn = false;
    let isBActive = (currentMode !== "NOT");

    if (currentMode === "AND") bulbOn = switchA.isOn && switchB.isOn;
    else if (currentMode === "OR")  bulbOn = switchA.isOn || switchB.isOn;
    else if (currentMode === "NOT") bulbOn = !switchA.isOn;

    // --- 2. DRAW MAIN WORKSPACE ---
    // Draw Input Switches
    drawBox(switchA, true); 
    drawBox(switchB, isBActive); 

    //Diagram
    drawGateShape(currentMode, 300, 170, 80, 60, bulbOn);

    // --- 3. DRAW WIRES ---
    ctx.beginPath();
    ctx.strokeStyle = bulbOn ? "#f1c40f" : "#2d4358ff"; // Yellow glow if power is flowing
    ctx.lineWidth = 4;

    // Wire from Switch A to Gate Input
    ctx.moveTo(switchA.x + switchA.w, switchA.y + 30);
    ctx.lineTo(300, 185);

    // Wire from Switch B to Gate Input (Ghosted if NOT mode)
    if (isBActive) {
        ctx.moveTo(switchB.x + switchB.w, switchB.y + 30);
        ctx.lineTo(300, 215);
    } else {
        // Show a faded wire for the disabled switch
        ctx.save();
        ctx.strokeStyle = "#bdc3c7"; 
        ctx.setLineDash([5, 5]); // Dotted line starts
        ctx.moveTo(switchB.x + switchB.w, switchB.y + 30);
        ctx.lineTo(300, 215);
        ctx.stroke();
        ctx.setLineDash([]); // <--- ADD THIS LINE to reset back to solid lines
        ctx.restore();
    }
    
    // Wire from Gate Output to Bulb
    ctx.moveTo(380, 200);
    ctx.lineTo(430, 200);
    ctx.stroke();

    // Bulb
    ctx.beginPath();
    ctx.arc(460, 200, 25, 0, Math.PI * 2);
    ctx.fillStyle = bulbOn ? "#f1c40f" : "#7f8c8d";
    ctx.shadowBlur = bulbOn ? 20 : 0; // Glowing effect
    ctx.shadowColor = "#f1c40f";
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // --- 4. SIDE MONITOR ---
    drawSidePanel();
}

// THE SHAPE ENGINE (Drawing the Diagrams)
function drawGateShape(type, x, y, width, height, isOn) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.fillStyle = isOn ? "#f1c40f" : "#ecf0f1"; 

    if (type === "AND") {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width / 2, y);
        ctx.arc(x + width / 2, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(x, y + height);
        ctx.closePath();
    } 
    else if (type === "OR") {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + width / 4, y + height / 2, x, y + height);
        ctx.bezierCurveTo(x + width, y + height, x + width, y, x, y);
        ctx.closePath();
    } 
    else if (type === "NOT") {
        ctx.moveTo(x, y + 5);
        ctx.lineTo(x, y + height - 5);
        ctx.lineTo(x + width - 15, y + height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath(); // The inversion bubble
        ctx.arc(x + width - 10, y + height / 2, 6, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "black";
    ctx.font = "bold 14px Arial";
    ctx.fillText(type + " GATE", x + 5, y + height + 25);
}

function drawBox(s, isActive) {
    ctx.lineWidth = 2;
    if (!isActive) {
        ctx.fillStyle = "#dfe6e9";
        ctx.strokeStyle = "#b2bec3";
    } else {
        ctx.fillStyle = s.isOn ? '#e67e22' : '#3498db';
        ctx.strokeStyle = "black";
    }
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = isActive ? 'white' : '#b2bec3';
    ctx.font = "bold 14px Arial";
    ctx.fillText(s.label + (!isActive ? " (N/A)" : ""), s.x + 15, s.y + 35);
}

function drawSidePanel() {
    const pX = 550;
    
    // 1. Draw Panel Background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(pX, 0, 250, 500);
    ctx.strokeStyle = "#dee2e6";
    ctx.strokeRect(pX, 0, 250, 500);

    // 2. THE LEGEND (Replacing "Live Monitor")
    // Draw the Orange "ON" Box
    ctx.fillStyle = "#e67e22"; // Your "ON" Orange
    ctx.fillRect(pX + 20, 20, 30, 20);
    ctx.strokeRect(pX + 20, 20, 30, 20);
    
    ctx.fillStyle = "black";
    ctx.font = "bold 14px Arial";
    ctx.fillText("- ON", pX + 60, 35);

    // Draw the Dark Blue "OFF" Box
    ctx.fillStyle = "#3498db"; // Your "OFF" Blue
    ctx.fillRect(pX + 130, 20, 30, 20);
    ctx.strokeRect(pX + 130, 20, 30, 20);
    
    ctx.fillStyle = "black";
    ctx.fillText("- OFF", pX + 170, 35);

    // 4. Mini Views (Gates) start below the legend
    drawMini(pX + 50, 100, "AND", switchA.isOn, switchB.isOn, switchA.isOn && switchB.isOn);
    drawMini(pX + 50, 220, "OR", switchA.isOn, switchB.isOn, switchA.isOn || switchB.isOn);
    drawMini(pX + 50, 340, "NOT", switchA.isOn, null, !switchA.isOn);
}

function drawMini(x, y, type, inA, inB, res) {
    // 1. Draw Input Status Dots (Small dots on the left)
    // Dot for Input A
    ctx.beginPath();
    ctx.arc(x - 15, y + 15, 6, 0, Math.PI * 2);
    ctx.fillStyle = inA ? "#e67e22" : "#3498db";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dot for Input B (unless it's a NOT gate)
    if (inB !== null) {
        ctx.beginPath();
        ctx.arc(x - 15, y + 45, 6, 0, Math.PI * 2);
        ctx.fillStyle = inB ? "#e67e22" : "#3498db";
        ctx.fill();
        ctx.stroke();
    }

    // 2. Draw the Gate Shape Diagram
    // drawGateShape(type, x_position, y_position, width, height, isPowered)
    drawGateShape(type, x + 20, y, 60, 40, res);
}

// INTERACTIONS
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    if (mx >= switchA.x && mx <= switchA.x + switchA.w && my >= switchA.y && my <= switchA.y + switchA.h) {
        switchA.isOn = !switchA.isOn;
    }
    if (currentMode !== "NOT") {
        if (mx >= switchB.x && mx <= switchB.x + switchB.w && my >= switchB.y && my <= switchB.y + switchB.h) {
            switchB.isOn = !switchB.isOn;
        }
    }
    drawScene();
});

function setMode(m) {
    currentMode = m;
    drawScene();
}

function resetAll() {
    switchA.isOn = false;
    switchB.isOn = false;
    drawScene();
}


drawScene();
