// --- Business Logic & State ---
let state = {
    currentWeeklyDose: 21,
    currentInr: 1.5,
    targetInr: 2.5,
    manualAdjustmentPercent: 0,
    newWeeklyDose: 21,
    appointmentDays: 30,
    availablePills: [2, 3, 5],
    dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dayShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayThai: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
};

// --- Core Algorithms ---

/**
 * Algorithm based on Warfarin Maintenance Therapy Table
 * Supports BOTH target ranges: 2.0-3.0 and 2.5-3.5
 */
function calculateSuggestedAdjustment(inr, target) {
    const isMajorBleeding = document.getElementById('major-bleeding').checked;
    if (isMajorBleeding) {
        return { text: "Major Bleeding! วิกฤต", hint: "Vit K 10 mg IV + FFP, Repeat Vit K ทุก 12 ชม. หากจำเป็น", percent: -100 };
    }

    if (!inr) return { text: "รอกรอกค่า INR", hint: "กรุณาระบุค่า INR ล่าสุด", percent: 0 };

    // Target INR 2.0 - 3.0 (AF/DVT/PE)
    if (target == 2.5) {
        if (inr < 1.5) return { text: "เพิ่มขนาดยา 10-20%", hint: "INR < 1.5: ต่ำกว่าเป้าหมายมาก", percent: 15 };
        if (inr >= 1.5 && inr <= 1.9) return { text: "เพิ่มขนาดยา 5-10%", hint: "INR 1.5–1.9: ต่ำกว่าเป้าหมายเล็กน้อย", percent: 7.5 };
        if (inr >= 2.0 && inr <= 3.0) return { text: "คงขนาดยาเดิม", hint: "INR 2.0–3.0: อยู่ในเกณฑ์เป้าหมาย ✓", percent: 0 };
        if (inr >= 3.1 && inr <= 3.9) return { text: "ลดขนาดยา 5-10%", hint: "INR 3.1–3.9: สูงกว่าเป้าหมายเล็กน้อย", percent: -7.5 };
        if (inr >= 4.0 && inr <= 4.9) return { text: "หยุดยา 1 dose + ลดขนาด 10%", hint: "INR 4.0–4.9: หยุดยา 1 dose แล้วลดขนาดยาลง", percent: -10 };
        if (inr >= 5.0 && inr <= 8.9) return { text: "หยุดยา 1-2 dose + Vit K₁ 1 mg", hint: "INR 5.0–8.9 (ไม่มีเลือดออก): หยุดยา 1-2 dose + Vit K₁ 1 mg กิน", percent: -15 };
        if (inr >= 9.0) return { text: "Vit K₁ 5-10 mg กิน + พบแพทย์", hint: "INR ≥ 9.0 (ไม่มีเลือดออก): Vit K₁ 5-10 mg กิน + ปรึกษาแพทย์ทันที", percent: -20 };
    }

    // Target INR 2.5 - 3.5 (Mechanical Heart Valve)
    if (target == 3.0) {
        if (inr < 1.9) return { text: "เพิ่มขนาดยา 10-20%", hint: "INR < 1.9: ต่ำกว่าเป้าหมายมาก (Target 2.5-3.5)", percent: 15 };
        if (inr >= 1.9 && inr <= 2.4) return { text: "เพิ่มขนาดยา 5-10%", hint: "INR 1.9–2.4: ต่ำกว่าเป้าหมายเล็กน้อย", percent: 7.5 };
        if (inr >= 2.5 && inr <= 3.5) return { text: "คงขนาดยาเดิม", hint: "INR 2.5–3.5: อยู่ในเกณฑ์เป้าหมาย ✓", percent: 0 };
        if (inr >= 3.6 && inr <= 4.5) return { text: "ลดขนาดยา 5-10%", hint: "INR 3.6–4.5: สูงกว่าเป้าหมายเล็กน้อย", percent: -7.5 };
        if (inr >= 4.6 && inr <= 4.9) return { text: "หยุดยา 1 dose + ลดขนาด 10%", hint: "INR 4.6–4.9: หยุดยา 1 dose แล้วลดขนาดยาลง", percent: -10 };
        if (inr >= 5.0 && inr <= 8.9) return { text: "หยุดยา 1-2 dose + Vit K₁ 1 mg", hint: "INR 5.0–8.9 (ไม่มีเลือดออก): หยุดยา 1-2 dose + Vit K₁ 1 mg กิน", percent: -15 };
        if (inr >= 9.0) return { text: "Vit K₁ 5-10 mg กิน + พบแพทย์", hint: "INR ≥ 9.0 (ไม่มีเลือดออก): Vit K₁ 5-10 mg กิน + ปรึกษาแพทย์ทันที", percent: -20 };
    }

    return { text: "ประมวลผลตามดุลยพินิจ", hint: "ตรวจสอบ Guideline เพิ่มเติม", percent: 0 };
}

const SINGLE_COLOR_DOSES = {
    1.0: [{ value: 1, color: 'orange', label: '2 mg', half: true }],
    1.5: [{ value: 1.5, color: 'blue', label: '3 mg', half: true }],
    2.0: [{ value: 2, color: 'orange', label: '2 mg' }],
    2.5: [{ value: 2.5, color: 'pink', label: '5 mg', half: true }],
    3.0: [{ value: 3, color: 'blue', label: '3 mg' }],
    4.0: [{ value: 2, color: 'orange', label: '2 mg' }, { value: 2, color: 'orange', label: '2 mg' }],
    4.5: [{ value: 3, color: 'blue', label: '3 mg' }, { value: 1.5, color: 'blue', label: '3 mg', half: true }],
    5.0: [{ value: 5, color: 'pink', label: '5 mg' }],
    6.0: [{ value: 3, color: 'blue', label: '3 mg' }, { value: 3, color: 'blue', label: '3 mg' }],
    7.5: [{ value: 5, color: 'pink', label: '5 mg' }, { value: 2.5, color: 'pink', label: '5 mg', half: true }],
    8.0: [{ value: 2, color: 'orange', label: '2 mg' }, { value: 2, color: 'orange', label: '2 mg' }, { value: 2, color: 'orange', label: '2 mg' }, { value: 2, color: 'orange', label: '2 mg' }],
    9.0: [{ value: 3, color: 'blue', label: '3 mg' }, { value: 3, color: 'blue', label: '3 mg' }, { value: 3, color: 'blue', label: '3 mg' }],
    10.0: [{ value: 5, color: 'pink', label: '5 mg' }, { value: 5, color: 'pink', label: '5 mg' }],
    12.5: [{ value: 5, color: 'pink', label: '5 mg' }, { value: 5, color: 'pink', label: '5 mg' }, { value: 2.5, color: 'pink', label: '5 mg', half: true }],
    15.0: [{ value: 5, color: 'pink', label: '5 mg' }, { value: 5, color: 'pink', label: '5 mg' }, { value: 5, color: 'pink', label: '5 mg' }]
};

function findOptimalPills(dose) {
    return SINGLE_COLOR_DOSES[dose] || [];
}

/**
 * Smart Grouping & Weekend Rule
 */
function generateDayDoses(weeklyDose) {
    if (weeklyDose <= 0) return new Array(7).fill(0);

    const validDoses = [0].concat(Object.keys(SINGLE_COLOR_DOSES).map(Number));

    let bestDist = null;
    let minDiff = Infinity;
    const avg = weeklyDose / 7;
    const sortedDoses = [...validDoses].sort((a, b) => Math.abs(a - avg) - Math.abs(b - avg));

    function search(dayIndex, currentSum, currentDist) {
        if (dayIndex === 7) {
            if (Math.abs(currentSum - weeklyDose) < 0.001) {
                let maxD = Math.max(...currentDist);
                let minD = Math.min(...currentDist);
                let diff = maxD - minD;
                if (diff < minDiff) {
                    minDiff = diff;
                    bestDist = [...currentDist];
                }
            }
            return;
        }

        let remDays = 7 - dayIndex;
        let maxPossible = currentSum + remDays * Math.max(...validDoses);
        if (maxPossible < weeklyDose - 0.001) return;

        for (let i = 0; i < sortedDoses.length; i++) {
            let d = sortedDoses[i];
            let tempMax = Math.max(...currentDist, d);
            let tempMin = Math.min(...currentDist, d);
            if (dayIndex > 0 && (tempMax - tempMin >= minDiff)) continue;

            if (currentSum + d <= weeklyDose + 0.001) {
                currentDist.push(d);
                search(dayIndex + 1, currentSum + d, currentDist);
                currentDist.pop();
            }
        }
    }

    search(0, 0, []);

    if (bestDist) {
        const freqMap = {};
        bestDist.forEach(d => freqMap[d] = (freqMap[d] || 0) + 1);
        const sortedUnique = Object.keys(freqMap).map(Number).sort((a, b) => freqMap[b] - freqMap[a]);

        let primaryDose = sortedUnique[0];
        let otherDoses = [];
        bestDist.forEach(d => { if (d !== primaryDose) otherDoses.push(d); });

        let finalDist = new Array(7).fill(primaryDose);
        let targetIndices = [6, 5, 4, 3, 2, 1, 0]; // Sun, Sat, Fri, Thu, Wed, Tue, Mon (Consecutive from end of week)
        for (let i = 0; i < otherDoses.length; i++) {
            finalDist[targetIndices[i]] = otherDoses[i];
        }
        return finalDist;
    }

    return new Array(7).fill(0);
}

/**
 * Calculate pill counts for appointment days
 */
function calculatePillCounts(weeklyDose, days) {
    const doses = generateDayDoses(weeklyDose);
    // Group by base pill (label + color), summing units (1 for full, 0.5 for half)
    const pillMap = {}; // key: "label-color" => { pill, unitsPerWeek }
    doses.forEach(dose => {
        const pills = findOptimalPills(dose);
        pills.forEach(p => {
            // Use the base pill label (e.g., '5 mg') and color as key
            const key = `${p.label}-${p.color}`;
            if (!pillMap[key]) {
                // Store a "full" version of the pill for the record
                const basePill = { ...p, half: false };
                pillMap[key] = { pill: basePill, unitsPerWeek: 0 };
            }
            pillMap[key].unitsPerWeek += (p.half ? 0.5 : 1);
        });
    });

    // Scale to appointment days
    const weeks = days / 7;
    const result = [];
    for (const key in pillMap) {
        const entry = pillMap[key];
        result.push({
            pill: entry.pill,
            totalCount: Math.ceil(entry.unitsPerWeek * weeks)
        });
    }
    return result;
}

// --- Helpers ---
function colorNameThai(color) {
    return color === 'pink' ? 'ชมพู' : (color === 'blue' ? 'ฟ้า' : 'ส้ม');
}

function pillDescription(pill) {
    return `Warfarin ${pill.label.split(' ')[0]} mg (สี${colorNameThai(pill.color)}) ${pill.half ? 'ครึ่งเม็ด' : '1 เม็ด'}`;
}

/**
 * Generate formatted instructions for each pill type
 * Returns: { pillName: { qty: { text, days } } }
 */
function formatQtyThai(qty) {
    if (qty === 0.5) return 'ครึ่งเม็ด';
    if (Number.isInteger(qty)) return `${qty} เม็ด`;
    const fullTablets = Math.floor(qty);
    return `${fullTablets} เม็ด + ครึ่งเม็ด`;
}

function generateMedicationInstructions(weeklyDose) {
    const doses = generateDayDoses(weeklyDose);
    const pillGroups = {};
    const colorMap = { 'pink': 'สีชมพู', 'blue': 'สีฟ้า', 'orange': 'สีส้ม' };

    doses.forEach((dose, i) => {
        if (dose === 0) return;
        const pills = findOptimalPills(dose);
        if (pills.length === 0) return;

        const totalQty = pills.reduce((sum, p) => sum + (p.half ? 0.5 : 1), 0);
        const pillLabel = pills[0].label.split(' ')[0];
        const pillColor = colorMap[pills[0].color];

        const pillKey = `Warfarin ${pillLabel} mg (${pillColor})`;

        const full = Math.floor(totalQty);
        const hasHalf = totalQty % 1 !== 0;

        if (full > 0) {
            const qtyText = `${full} เม็ด`;
            if (!pillGroups[pillKey]) pillGroups[pillKey] = {};
            if (!pillGroups[pillKey][qtyText]) pillGroups[pillKey][qtyText] = [];
            pillGroups[pillKey][qtyText].push(state.dayThai[i]);
        }
        if (hasHalf) {
            const qtyText = `ครึ่งเม็ด`;
            if (!pillGroups[pillKey]) pillGroups[pillKey] = {};
            if (!pillGroups[pillKey][qtyText]) pillGroups[pillKey][qtyText] = [];
            pillGroups[pillKey][qtyText].push(state.dayThai[i]);
        }
    });

    const results = [];

    // Add HOLD days if any
    const holdDays = doses.map((d, i) => d === 0 ? state.dayThai[i] : null).filter(d => d);
    if (holdDays.length > 0) {
        results.push({
            pillName: 'งดยา (HOLD)',
            qty: 'งดยา',
            days: 'วัน' + holdDays.join(' '),
            fullText: `งดยา (HOLD) วัน${holdDays.join(' ')}`
        });
    }

    const colorHexMap = { 'pink': '#ec4899', 'blue': '#0ea5e9', 'orange': '#f97316' };

    for (const pillName in pillGroups) {
        for (const qty in pillGroups[pillName]) {
            const days = pillGroups[pillName][qty];

            // Reconstruct HTML version for colored display
            const matches = pillName.match(/Warfarin (\d+) mg \((.+)\)/);
            let htmlText = `${pillName} รับประทาน ครั้งละ ${qty} วัน${days.join(' ')} ก่อนนอน`;

            if (matches) {
                const mg = matches[1];
                const cn = matches[2];
                let color = '#000';
                for (const [key, val] of Object.entries(colorMap)) {
                    if (val === cn) color = colorHexMap[key];
                }
                htmlText = `Warfarin ${mg} mg <span style="color:${color}">(${cn})</span> รับประทาน ครั้งละ ${qty} วัน${days.join(' ')} ก่อนนอน`;
            }

            results.push({
                pillName,
                qty,
                days: 'วัน' + days.join(' '),
                fullText: `${pillName} รับประทาน ครั้งละ ${qty} วัน${days.join(' ')} ก่อนนอน`,
                htmlText: htmlText
            });
        }
    }
    return results;
}

// --- UI Updates ---

function updateUI() {
    const inr = parseFloat(document.getElementById('current-inr').value) || 0;
    const target = parseFloat(document.getElementById('target-inr').value) || 2.5;
    state.targetInr = target;

    const suggestion = calculateSuggestedAdjustment(inr, target);
    document.getElementById('suggestion-text').innerText = suggestion.text;
    document.getElementById('suggestion-hint').innerText = suggestion.hint;

    const critAlert = document.getElementById('critical-alert');
    const isMajorBleeding = document.getElementById('major-bleeding').checked;

    if (inr > 4.5 || isMajorBleeding) {
        critAlert.classList.remove('hidden');
        if (isMajorBleeding) {
            critAlert.querySelector('h3').innerText = "⚠️ EMERGENCY: Major Bleeding";
            critAlert.querySelector('p').innerText = "Vitamin K 10 mg IV + FFP | Repeat Vit K every 12 hrs if needed";
        } else {
            critAlert.querySelector('h3').innerText = "⚠️ INR > 4.5 — ระดับอันตราย";
            critAlert.querySelector('p').innerText = "พิจารณา Hold ยา และปรับลดขนาดยา ตรวจสอบอาการเลือดออก หรือส่งพบแพทย์ทันที";
        }
    } else {
        critAlert.classList.add('hidden');
    }

    state.newWeeklyDose = Math.round((state.currentWeeklyDose * (1 + state.manualAdjustmentPercent / 100)) * 2) / 2;

    // Calculate ACTUAL % change after rounding
    const actualPercent = state.currentWeeklyDose > 0
        ? ((state.newWeeklyDose - state.currentWeeklyDose) / state.currentWeeklyDose * 100)
        : 0;

    const adjustmentSlider = document.getElementById('adjustment-slider');
    if (state.currentWeeklyDose > 0) {
        adjustmentSlider.step = ((0.5 / state.currentWeeklyDose) * 100).toString();
    } else {
        adjustmentSlider.step = "2.5";
    }

    const adjustmentLabel = document.getElementById('adjustment-percent');
    adjustmentLabel.innerText = (actualPercent > 0 ? '+' : (actualPercent < 0 ? '' : '')) + actualPercent.toFixed(1) + '%';
    adjustmentSlider.value = state.manualAdjustmentPercent;

    const doseInput = document.getElementById('new-weekly-dose-input');
    if (doseInput && document.activeElement !== doseInput) {
        doseInput.value = state.newWeeklyDose.toFixed(1);
    }

    const scheduleTwdBadge = document.getElementById('schedule-twd-badge');
    if (scheduleTwdBadge) scheduleTwdBadge.innerText = state.newWeeklyDose.toFixed(1);

    const warningBox = document.getElementById('warning-box');
    if (Math.abs(state.manualAdjustmentPercent) > 20) { warningBox.classList.remove('hidden'); } else { warningBox.classList.add('hidden'); }

    // Update Print View placeholders
    const printCurrent = document.getElementById('print-current-dose');
    const printNew = document.getElementById('print-new-dose');
    const printAdj = document.getElementById('print-adj-percent');
    if (printCurrent) printCurrent.innerText = state.currentWeeklyDose.toFixed(1);
    if (printNew) printNew.innerText = state.newWeeklyDose.toFixed(1);
    if (printAdj) printAdj.innerText = (state.manualAdjustmentPercent > 0 ? '+' : '') + state.manualAdjustmentPercent.toFixed(1);

    renderSchedules();
    renderPillCalculator();
}

function renderSchedules() {
    const newDoses = generateDayDoses(state.newWeeklyDose);
    const newTable = document.getElementById('new-schedule-table');
    const printTable = document.getElementById('print-schedule');
    if (newTable) newTable.innerHTML = '';
    if (printTable) printTable.innerHTML = '';
    state.dayThai.forEach((day, index) => {
        if (newTable) newTable.appendChild(createDayRow(day, newDoses[index]));
        if (printTable) printTable.appendChild(createPrintRow(day, newDoses[index]));
    });

    // Update print instructions summary at bottom
    const printInstrContainer = document.getElementById('print-instructions');
    if (printInstrContainer) {
        const instrs = generateMedicationInstructions(state.newWeeklyDose);
        printInstrContainer.innerHTML = instrs.map(ins => `<div style="margin-bottom:8px;">${ins.htmlText || ins.fullText}</div>`).join('');
    }
}

function createDayRow(day, dose) {
    const row = document.createElement('div');
    row.className = 'flex items-stretch rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-all overflow-hidden';

    const daySection = document.createElement('div');
    daySection.className = `${getDayColorClass(day)} text-white flex items-center justify-center font-black text-sm px-3 md:px-5 min-w-[70px] md:min-w-[90px]`;
    daySection.innerText = day;

    const contentSection = document.createElement('div');
    contentSection.className = 'flex-1 flex items-center justify-between px-3 py-2 md:px-4 md:py-3 gap-2 flex-wrap';

    const pills = findOptimalPills(dose);
    if (dose === 0) {
        contentSection.innerHTML = `<span class="text-red-600 font-black text-sm"><i class="fa-solid fa-hand mr-1"></i>งดยา – ไม่ต้องกินยาวันนี้</span>`;
    } else if (pills.length > 0) {
        const totalQty = pills.reduce((sum, p) => sum + (p.half ? 0.5 : 1), 0);
        const pill = pills[0]; // Guaranteed single color
        const label = pill.label.split(' ')[0];
        const cn = colorNameThai(pill.color);
        const pillTextColor = pill.color === 'pink' ? '#ec4899' : (pill.color === 'blue' ? '#0ea5e9' : '#f97316');

        const full = Math.floor(totalQty);
        const hasHalf = (totalQty % 1 !== 0);

        if (full > 0 && hasHalf) {
            let dots = "";
            for (let j = 0; j < full; j++) {
                dots += `<span class="pill-render pill-${pill.color}" style="width:20px;height:20px;"></span>`;
            }

            contentSection.className = 'flex-1 flex items-center px-0 md:px-0 py-0 gap-0';
            contentSection.innerHTML = `
                <div class="flex-1 flex flex-col px-3 py-2 md:px-4 md:py-3 gap-2 border-r border-slate-100 h-full justify-center">
                    <div class="flex items-center gap-1.5 justify-between">
                        <div class="flex items-center gap-1.5">
                            <div class="flex items-center gap-1 mr-1">${dots}</div>
                            <span class="text-sm font-bold">Warfarin ${label} mg <span style="color:${pillTextColor}">(สี${cn})</span> <span class="text-blue-600 underline">${full} เม็ด</span></span>
                        </div>
                        <span class="text-slate-300 font-bold ml-2">+</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="pill-render pill-${pill.color} half-pill" style="width:20px;height:20px;"></span>
                        <span class="text-sm font-bold">Warfarin ${label} mg <span style="color:${pillTextColor}">(สี${cn})</span> <span class="text-blue-600 underline">ครึ่งเม็ด</span></span>
                    </div>
                </div>
                <div class="flex items-center justify-center min-w-[100px] md:min-w-[140px] px-2 h-full bg-slate-50/50">
                    <span class="text-amber-600 font-black text-lg md:text-xl tracking-tight leading-none bg-white py-2 px-3 rounded-lg shadow-sm border border-amber-100">ก่อนนอน</span>
                </div>
            `;
        } else {
            let displayHTML = '';
            if (full > 0) {
                let dots = "";
                for (let j = 0; j < full; j++) {
                    dots += `<span class="pill-render pill-${pill.color}" style="width:20px;height:20px;"></span>`;
                }
                displayHTML += `<span class="flex items-center gap-1.5"><span class="flex items-center gap-1 mr-1">${dots}</span><span class="text-sm font-bold text-base">Warfarin ${label} mg <span style="color:${pillTextColor}">(สี${cn})</span> <span class="text-blue-600 underline md:text-lg">${full} เม็ด</span></span></span>`;
            } else if (hasHalf) {
                displayHTML += `<span class="flex items-center gap-1.5"><span class="pill-render pill-${pill.color} half-pill" style="width:20px;height:20px;"></span><span class="text-sm font-bold text-base">Warfarin ${label} mg <span style="color:${pillTextColor}">(สี${cn})</span> <span class="text-blue-600 underline md:text-lg">ครึ่งเม็ด</span></span></span>`;
            }

            contentSection.className = 'flex-1 flex items-center px-0 py-0';
            contentSection.innerHTML = `
                <div class="flex-1 flex items-center px-4 py-3 border-r border-slate-100 h-full">${displayHTML}</div>
                <div class="flex items-center justify-center min-w-[100px] md:min-w-[140px] px-2 h-full bg-slate-50/50">
                    <span class="text-amber-600 font-black text-lg md:text-xl tracking-tight leading-none bg-white py-2 px-3 rounded-lg shadow-sm border border-amber-100">ก่อนนอน</span>
                </div>
            `;
        }
    } else {
        contentSection.innerHTML = `<span class="text-red-500 font-bold text-sm">สูตรยาซับซ้อน โปรดปรึกษาเภสัชกร</span>`;
    }

    row.appendChild(daySection);
    row.appendChild(contentSection);
    return row;
}

function getDayColorClass(day) {
    const map = {
        'จันทร์': 'bg-yellow-500', 'อังคาร': 'bg-pink-500', 'พุธ': 'bg-green-500',
        'พฤหัสบดี': 'bg-orange-500', 'ศุกร์': 'bg-sky-500', 'เสาร์': 'bg-purple-500', 'อาทิตย์': 'bg-red-500'
    };
    return map[day] || 'bg-slate-400';
}

function createPrintRow(day, dose) {
    const row = document.createElement('div');
    row.className = 'print-row';

    const pills = findOptimalPills(dose);
    let instr = '';
    if (dose === 0) {
        instr = '<div style="color:red;font-weight:900;">งดยา – ไม่ต้องกินยาวันนี้</div>';
    } else if (pills.length > 0) {
        const totalQty = pills.reduce((sum, p) => sum + (p.half ? 0.5 : 1), 0);
        const p = pills[0]; // Guaranteed single color
        const cn = colorNameThai(p.color);
        const label = p.label.split(' ')[0];
        const pillColor = p.color === 'pink' ? '#ff8fa3' : (p.color === 'blue' ? '#38bdf8' : '#fb923c');

        const full = Math.floor(totalQty);
        const hasHalf = (totalQty % 1 !== 0);

        const timingHTML = `<div style="display:flex;align-items:center;justify-content:center;background:#fffbeb;min-width:140px;height:100%;border-left:1px dashed #fbd38d;color:#d97706;font-size:24px;font-weight:900;">ก่อนนอน</div>`;

        if (full > 0 && hasHalf) {
            let dots = "";
            for (let j = 0; j < full; j++) {
                const style = `display:inline-block;width:22px;height:22px;border-radius:50%;background:${pillColor};vertical-align:middle;margin-right:4px;`;
                dots += `<span style="${style}"></span>`;
            }

            instr = `
                <div style="display:flex;height:100%;align-items:stretch;">
                    <div style="flex:1;display:flex;flex-direction:column;gap:12px;padding:12px 0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-right:20px;">
                            <span>Warfarin ${label} mg <span style="color:${pillColor}">(สี${cn})</span> <b>${full} เม็ด</b> <span style="margin-right:4px;">${dots}</span></span>
                            <b style="color:#cbd5e1;font-size:20px;">+</b>
                        </div>
                        <div>
                            <span>Warfarin ${label} mg <span style="color:${pillColor}">(สี${cn})</span> <b>ครึ่งเม็ด</b> <span style="display:inline-block;width:11px;height:22px;border-radius:22px 0 0 22px;background:${pillColor};vertical-align:middle;margin-left:4px;"></span></span>
                        </div>
                    </div>
                    ${timingHTML}
                </div>
            `;
        } else {
            let displayText = "";
            if (full > 0) {
                let dots = "";
                for (let j = 0; j < full; j++) {
                    const style = `display:inline-block;width:22px;height:22px;border-radius:50%;background:${pillColor};vertical-align:middle;margin-right:4px;`;
                    dots += `<span style="${style}"></span>`;
                }
                displayText = `Warfarin ${label} mg <span style="color:${pillColor}">(สี${cn})</span> <b>${full} เม็ด</b> <span style="margin-right:4px;">${dots}</span>`;
            } else if (hasHalf) {
                displayText = `Warfarin ${label} mg <span style="color:${pillColor}">(สี${cn})</span> <b>ครึ่งเม็ด</b> <span style="display:inline-block;width:11px;height:22px;border-radius:22px 0 0 22px;background:${pillColor};vertical-align:middle;margin-left:4px;"></span>`;
            }

            instr = `
                <div style="display:flex;height:100%;align-items:center;">
                    <div style="flex:1;font-size:20px;">${displayText}</div>
                    ${timingHTML}
                </div>
            `;
        }
    }

    const dayColors = {
        'จันทร์': { bg: '#eab308', text: '#000' }, // Yellow
        'อังคาร': { bg: '#ec4899', text: '#fff' }, // Pink
        'พุธ': { bg: '#22c55e', text: '#fff' }, // Green
        'พฤหัสบดี': { bg: '#f97316', text: '#fff' }, // Orange
        'ศุกร์': { bg: '#0ea5e9', text: '#fff' }, // Blue
        'เสาร์': { bg: '#a855f7', text: '#fff' }, // Purple
        'อาทิตย์': { bg: '#ef4444', text: '#fff' } // Red
    };
    const color = dayColors[day] || { bg: '#64748b', text: '#fff' };
    const dayStyle = `display:inline-block;background:${color.bg};color:${color.text};padding:4px 10px;border-radius:6px;min-width:140px;text-align:center;`;

    row.innerHTML = `<span class="print-day" style="${dayStyle}">${day}</span><span class="print-instr" style="margin-left:20px;">${instr}</span>`;
    return row;
}

function renderPillCalculator() {
    const container = document.getElementById('pill-count-container');
    if (!container) return;

    const days = state.appointmentDays;
    const instructions = generateMedicationInstructions(state.newWeeklyDose);
    const weeks = days / 7;

    if (instructions.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm italic">กรุณาระบุขนาดยาก่อน</p>';
        return;
    }

    let html = `<div class="text-xs font-bold text-slate-400 mb-2 uppercase">จำนวนเม็ดยาที่ต้องจ่ายคนไข้ (${days} วัน)</div>`;
    html += '<div class="space-y-2">';

    instructions.forEach(ins => {
        // Find the color of the pill mentioned in the instruction
        let pillColor = 'orange';
        if (ins.pillName.includes('สีฟ้า')) pillColor = 'blue';
        if (ins.pillName.includes('สีชมพู')) pillColor = 'pink';
        const cn = colorNameThai(pillColor);
        const textColor = pillColor === 'pink' ? '#ec4899' : (pillColor === 'blue' ? '#0ea5e9' : '#f97316');

        // Calculate count for this specific instruction (this bag)
        const daysPerWeek = ins.days.split(' ').filter(d => d.trim() && d !== 'วัน').length;

        let qtyPerDay = 1;
        if (ins.qty === 'ครึ่งเม็ด') qtyPerDay = 0.5;
        else if (ins.qty.includes('+')) {
            const parts = ins.qty.split('+');
            qtyPerDay = parseInt(parts[0]) + 0.5;
        } else {
            qtyPerDay = parseInt(ins.qty) || 1;
        }

        const totalTablets = Math.ceil(qtyPerDay * daysPerWeek * weeks);

        // Rendering dots for the instruction row
        let dots = "";
        const full = Math.floor(qtyPerDay);
        const hasHalf = qtyPerDay % 1 !== 0;
        for (let j = 0; j < full; j++) {
            dots += `<div class="pill-render pill-${pillColor}" style="width:24px;height:24px;"></div>`;
        }
        if (hasHalf) {
            dots += `<div class="pill-render pill-${pillColor} half-pill" style="width:24px;height:24px;"></div>`;
        }

        html += `
            <div class="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1">${dots}</div>
                    <div>
                        <div class="text-sm font-bold text-slate-700">${ins.pillName}</div>
                        <div class="text-[11px] font-medium" style="color:${textColor};">รับประทานครั้งละ ${ins.qty} (${ins.days}) ก่อนนอน</div>
                    </div>
                </div>
                <div class="text-blue-700 font-black text-lg">${totalTablets} <small class="text-xs font-bold text-blue-400">เม็ด</small></div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// --- Event Listeners ---

document.getElementById('current-weekly-dose').addEventListener('input', (e) => {
    state.currentWeeklyDose = parseFloat(e.target.value) || 0;
    state.manualAdjustmentPercent = 0;
    updateUI();
});

document.getElementById('current-inr').addEventListener('input', updateUI);
document.getElementById('target-inr').addEventListener('change', updateUI);

document.getElementById('adjustment-slider').addEventListener('input', (e) => {
    state.manualAdjustmentPercent = parseFloat(e.target.value);
    updateUI();
});

document.getElementById('inc-percent').addEventListener('click', () => {
    if (state.currentWeeklyDose > 0) {
        let desiredDose = state.newWeeklyDose + 0.5;
        state.manualAdjustmentPercent = ((desiredDose / state.currentWeeklyDose) - 1) * 100;
        state.manualAdjustmentPercent = Math.max(-50, Math.min(50, state.manualAdjustmentPercent));
    } else {
        state.manualAdjustmentPercent = Math.min(50, state.manualAdjustmentPercent + 2.5);
    }
    updateUI();
});

document.getElementById('dec-percent').addEventListener('click', () => {
    if (state.currentWeeklyDose > 0) {
        let desiredDose = Math.max(0, state.newWeeklyDose - 0.5);
        state.manualAdjustmentPercent = ((desiredDose / state.currentWeeklyDose) - 1) * 100;
        state.manualAdjustmentPercent = Math.max(-50, Math.min(50, state.manualAdjustmentPercent));
    } else {
        state.manualAdjustmentPercent = Math.max(-50, state.manualAdjustmentPercent - 2.5);
    }
    updateUI();
});

document.getElementById('new-weekly-dose-input').addEventListener('input', (e) => {
    state.newWeeklyDose = parseFloat(e.target.value) || 0;
    if (state.currentWeeklyDose > 0) {
        state.manualAdjustmentPercent = ((state.newWeeklyDose / state.currentWeeklyDose) - 1) * 100;
        state.manualAdjustmentPercent = Math.max(-50, Math.min(50, state.manualAdjustmentPercent));
    }
    updateUI();
});

// Appointment day buttons
document.querySelectorAll('.appt-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.appointmentDays = parseInt(btn.dataset.days);
        document.querySelectorAll('.appt-day-btn').forEach(b => b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-100'));
        btn.classList.add('ring-2', 'ring-blue-500', 'bg-blue-100');
        renderPillCalculator();
    });
});

document.getElementById('major-bleeding').addEventListener('change', updateUI);

// Copy Note (improved, readable format as requested)
document.getElementById('copy-note').addEventListener('click', () => {
    const doses = generateDayDoses(state.newWeeklyDose);
    const adjType = state.manualAdjustmentPercent >= 0 ? 'เพิ่มขึ้น' : 'ลดลง';
    const adjAbs = Math.abs(state.manualAdjustmentPercent).toFixed(1);

    let note = `ขนาดยารวม ${state.newWeeklyDose.toFixed(1)} mg / wk (${adjType} ${adjAbs}%)\n`;

    const instructions = generateMedicationInstructions(state.newWeeklyDose);
    instructions.forEach(ins => {
        note += `${ins.fullText}\n`;
    });

    navigator.clipboard.writeText(note.trim()).then(() => {
        const btn = document.getElementById('copy-note');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> คัดลอกแล้ว!';
        btn.classList.add('!bg-green-600');
        setTimeout(() => { btn.innerHTML = originalText; btn.classList.remove('!bg-green-600'); }, 2000);
    });
});

document.getElementById('print-slip').addEventListener('click', () => { window.print(); });

// Initial Load
updateUI();
