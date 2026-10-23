tailwind.config = {
      darkMode: 'class',
      theme: { extend: { fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] } } }
    }

const $ = id => document.getElementById(id);
    
    // উন্নত এবং নিরাপদ সেভ ফাংশন যাতে ডাটা হারিয়ে না যায়
    function saveData(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Storage limit exceeded or blocked", e);
        showNotification("Warning: Data could not be saved. Storage might be full.", "Error");
      }
    }

    let currentSection = null;
    let selectedDay = 1;
    
    const now = new Date();
    const defaultYear = now.getFullYear();
    const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');
    let activeMonthKey = localStorage.getItem("activeMonthKey") || `${defaultYear}-${defaultMonth}`;
    
    // ডিফল্ট কিছু মাস্টার আইটেম যুক্ত করা হলো যাতে প্রথমবার অ্যাপ ব্ল্যা๊ংক না দেখায়
    const defaultMasterItems = [

    ];

    let storedMasterItems = localStorage.getItem("allMasterItems");
    let allMasterItems = storedMasterItems ? JSON.parse(storedMasterItems) : defaultMasterItems;
    if(!storedMasterItems) {
      saveData("allMasterItems", allMasterItems);
    }

    let monthlyDeliveries = JSON.parse(localStorage.getItem("monthlyDeliveries")) || {};
    let budgets = JSON.parse(localStorage.getItem("hostelBudgets")) || { boys: 525000, girls: 525000 };

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    function getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }

    function initPeriodSelectors() {
      const yearSelect = $("activeYearSelect");
      const monthSelect = $("activeMonthSelect");
      if(!yearSelect || !monthSelect) return;

      yearSelect.innerHTML = "";
      monthSelect.innerHTML = "";

      let parts = activeMonthKey.split("-");
      let currentY = parseInt(parts[0]) || now.getFullYear();
      let currentM = parts[1] || defaultMonth;

      for(let y = now.getFullYear() - 2; y <= now.getFullYear() + 3; y++) {
        let opt = document.createElement("option");
        opt.value = y;
        opt.text = y;
        if(y === currentY) opt.selected = true;
        yearSelect.appendChild(opt);
      }

      monthNames.forEach((mName, idx) => {
        let mVal = String(idx + 1).padStart(2, '0');
        let opt = document.createElement("option");
        opt.value = mVal;
        opt.text = mName;
        if(mVal === currentM) opt.selected = true;
        monthSelect.appendChild(opt);
      });

      updateActivePeriodIndicator();
      updateRemarksDefaultInputs();
    }

    function updateRemarksDefaultInputs() {
      let parts = activeMonthKey.split("-");
      let y = parts[0];
      let mIndex = parseInt(parts[1]) - 1;
      let mName = monthNames[mIndex] || "";
      let defaultRemarks = `${mName} ${y}`;

      if($("reportMonthInput")) $("reportMonthInput").value = defaultRemarks;
      if($("reportMonthCombinedInput")) $("reportMonthCombinedInput").value = defaultRemarks;
    }

    function onYearChange() {
      const y = $("activeYearSelect").value;
      const m = $("activeMonthSelect").value;
      activeMonthKey = `${y}-${m}`;
      localStorage.setItem("activeMonthKey", activeMonthKey);
      
      let totalDays = getDaysInMonth(parseInt(y), parseInt(m));
      if (selectedDay > totalDays) selectedDay = totalDays;

      updateRemarksDefaultInputs();
      if(currentSection === 'combined') populateCombinedDaySelector();
      refreshActiveSection();
    }

    function onMonthChange() {
      const y = $("activeYearSelect").value;
      const m = $("activeMonthSelect").value;
      activeMonthKey = `${y}-${m}`;
      localStorage.setItem("activeMonthKey", activeMonthKey);
      
      let totalDays = getDaysInMonth(parseInt(y), parseInt(m));
      if (selectedDay > totalDays) selectedDay = totalDays;

      updateRemarksDefaultInputs();
      if(currentSection === 'combined') populateCombinedDaySelector();
      refreshActiveSection();
    }

    function updateActivePeriodIndicator() {
      const indicator = $("activePeriodIndicator");
      if(!indicator) return;
      let parts = activeMonthKey.split("-");
      let y = parts[0];
      let mIndex = parseInt(parts[1]) - 1;
      let mName = monthNames[mIndex] || "Month";
      indicator.innerText = `${mName} ${y}`;
    }

    function refreshActiveSection() {
      updateActivePeriodIndicator();
      if (currentSection && (currentSection === 'boys' || currentSection === 'girls')) {
        populateDayRibbon();
        loadDayData();
      } else if (currentSection === 'combined') {
        populateCombinedDaySelector();
        loadCombinedData();
      }
    }

    function showNotification(message, title = "Notice") {
      $("notificationTitle").innerText = title;
      $("notificationMessage").innerText = message;
      $("notificationModal").classList.remove("hidden");
    }

    function closeNotification() {
      $("notificationModal").classList.add("hidden");
    }

    window.showSettingsCategory = function(category) {
      const valid = ['appearance','rates','budget','backup'];
      if (!valid.includes(category)) category = 'appearance';
      document.querySelectorAll('[data-setting-panel]').forEach(panel => {
        panel.classList.toggle('settings-category-hidden', panel.dataset.settingPanel !== category);
      });
      const financeGrid = $('settingsFinanceGrid');
      if (financeGrid) financeGrid.classList.toggle('settings-category-hidden', category !== 'budget' && category !== 'backup');
      document.querySelectorAll('[data-settings-category]').forEach(btn => {
        const active = btn.dataset.settingsCategory === category;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    };

    function openLandingSettings() {
      window.showSettingsCategory('appearance');
      $("budgetBoysInput").value = budgets.boys;
      $("budgetGirlsInput").value = budgets.girls;
      loadMasterTables();
      $("settingsModal").classList.remove("hidden");
    }

    function closeSettingsModal() {
      $("settingsModal").classList.add("hidden");
    }

    function saveBudgets() {
      const boysRaw = $("budgetBoysInput").value;
      const girlsRaw = $("budgetGirlsInput").value;
      const boysValue = Number(boysRaw);
      const girlsValue = Number(girlsRaw);
      if (boysRaw.trim() === "" || girlsRaw.trim() === "" || !Number.isFinite(boysValue) || !Number.isFinite(girlsValue) || boysValue < 0 || girlsValue < 0) {
        showNotification("Budget must be a valid non-negative number. Negative values are not allowed.", "Invalid Budget");
        return;
      }
      budgets.boys = boysValue;
      budgets.girls = girlsValue;
      saveData("hostelBudgets", budgets);
      updateCombinedBudgetCards();
      showNotification("Budgets saved successfully!", "Success");
    }

    function exportJSONBackup() {
      const backupData = { monthlyDeliveries, allMasterItems, hostelBudgets: budgets, backupDate: new Date().toISOString() };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `food_supply_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function importJSONBackup(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedData = JSON.parse(e.target.result);
          if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) throw new Error('Invalid backup structure');
          const validNonNegative = value => Number.isFinite(Number(value)) && Number(value) >= 0;
          if (importedData.hostelBudgets && (!validNonNegative(importedData.hostelBudgets.boys) || !validNonNegative(importedData.hostelBudgets.girls))) throw new Error('Negative or invalid budget');
          if (importedData.allMasterItems && (!Array.isArray(importedData.allMasterItems) || importedData.allMasterItems.some(item => !item || (item.id !== undefined && !validNonNegative(item.id)) || (item.rate !== undefined && !validNonNegative(item.rate))))) throw new Error('Negative or invalid catalog values');
          if (importedData.monthlyDeliveries) {
            if (typeof importedData.monthlyDeliveries !== 'object' || Array.isArray(importedData.monthlyDeliveries)) throw new Error('Invalid delivery data');
            for (const month of Object.values(importedData.monthlyDeliveries)) {
              for (const side of ['boys','girls']) {
                const days = month?.[side] || {};
                if (typeof days !== 'object' || Array.isArray(days)) throw new Error('Invalid delivery day data');
                for (const rows of Object.values(days)) {
                  if (!Array.isArray(rows)) throw new Error('Invalid delivery rows');
                  for (const item of rows) {
                    if (!item || !validNonNegative(item.rate ?? 0)) throw new Error('Negative or invalid item rate');
                    const qty = Number(item.qty ?? 0);
                    const type = String(item.entryType || '').toLowerCase();
                    if (!Number.isFinite(qty) || (qty < 0 && !['return','correction','adjustment'].includes(type))) throw new Error('Negative or invalid quantity');
                  }
                }
              }
            }
          }
          if (importedData.monthlyDeliveries) { monthlyDeliveries = importedData.monthlyDeliveries; saveData("monthlyDeliveries", monthlyDeliveries); }
          if (importedData.allMasterItems) { allMasterItems = importedData.allMasterItems; saveData("allMasterItems", allMasterItems); }
          if (importedData.hostelBudgets) { budgets = importedData.hostelBudgets; saveData("hostelBudgets", budgets); }
          showNotification("All Data Restored Successfully!", "Success");
          closeSettingsModal();
          if (currentSection) selectSection(currentSection);
          else loadMasterTables();
        } catch (err) {
          console.warn('Backup validation failed:', err);
          showNotification("Backup not restored. The file is invalid or contains negative/invalid numeric data.", "Backup Error");
        }
      };
      reader.readAsText(file);
    }

    function loadMasterTables() {
      const groceryBody = $("masterGroceryBody");
      const vegBody = $("masterVegBody");
      groceryBody.innerHTML = "";
      vegBody.innerHTML = "";

      if(allMasterItems.length === 0) {
        groceryBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center opacity-50">No items found.</td></tr>`;
        vegBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center opacity-50">No items found.</td></tr>`;
        return;
      }

      allMasterItems.forEach((item, index) => {
        let rowHTML = `
          <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="p-3 font-bold text-emerald-300">${item.id || (index + 1)}</td>
            <td class="p-3 font-medium text-white">${item.name}</td>
            <td class="p-3 text-slate-300">${item.unit}</td>
            <td class="p-3 font-bold text-emerald-400">₹${item.rate}</td>
            <td class="p-3 text-center flex items-center justify-center gap-1.5">
              <button onclick="openEditMasterModal(${index})" class="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/30 transition-all cursor-pointer">Edit</button>
              <button onclick="deleteMasterItem(${index})" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-rose-500/30 transition-all cursor-pointer">Del</button>
            </td>
          </tr>`;
        if (item.cat === 'grocery') groceryBody.innerHTML += rowHTML;
        else vegBody.innerHTML += rowHTML;
      });
    }

    function openEditMasterModal(index) {
      let item = allMasterItems[index];
      $("editMasterIndex").value = index;
      $("editMasterId").value = item.id || (index + 1);
      $("editMasterName").value = item.name;
      $("editMasterUnit").value = item.unit;
      $("editMasterRate").value = item.rate;
      $("editMasterModal").classList.remove("hidden");
    }

    function closeEditMasterModal() {
      $("editMasterModal").classList.add("hidden");
    }

    function updateMasterItemFromModal() {
      let index = parseInt($("editMasterIndex").value);
      const idRaw = $("editMasterId").value;
      const rateRaw = $("editMasterRate").value;
      const newId = Number(idRaw);
      const newName = $("editMasterName").value.trim();
      const newUnit = $("editMasterUnit").value.trim() || "Kg";
      const newRate = Number(rateRaw);

      if(!newName) { showNotification("Item name cannot be empty!", "Warning"); return; }
      if(idRaw.trim() === "" || !Number.isFinite(newId) || newId < 0 || rateRaw.trim() === "" || !Number.isFinite(newRate) || newRate < 0) {
        showNotification("Serial number and rate must be valid non-negative numbers.", "Invalid Item Data"); return;
      }

      allMasterItems[index].id = newId;
      allMasterItems[index].name = newName;
      allMasterItems[index].unit = newUnit;
      allMasterItems[index].rate = newRate;

      saveData("allMasterItems", allMasterItems);
      closeEditMasterModal();
      loadMasterTables();
      if(currentSection && (currentSection === 'boys' || currentSection === 'girls')) {
        filterItemsByCategory();
        loadDayData();
      }
    }

    function addMasterItem(cat) {
      let nameField = cat === 'grocery' ? $("newGroceryName") : $("newVegName");
      let unitField = cat === 'grocery' ? $("newGroceryUnit") : $("newVegUnit");
      let rateField = cat === 'grocery' ? $("newGroceryRate") : $("newVegRate");

      let nameVal = nameField.value.trim();
      let unit = unitField.value.trim() || "Kg";
      const rateRaw = rateField.value;
      const rate = Number(rateRaw);

      if(!nameVal) { showNotification("Please enter item name!", "Warning"); return; }
      if(rateRaw.trim() === "" || !Number.isFinite(rate) || rate < 0) { showNotification("Rate must be a valid non-negative number.", "Invalid Rate"); return; }

      let newId = allMasterItems.length > 0 ? Math.max(...allMasterItems.map(i => i.id || 0)) + 1 : 1;
      allMasterItems.push({ id: newId, name: nameVal, unit, rate, cat });
      saveData("allMasterItems", allMasterItems);
      nameField.value = ""; unitField.value = ""; rateField.value = "";
      loadMasterTables();
    }

    function deleteMasterItem(index) {
      allMasterItems.splice(index, 1);
      saveData("allMasterItems", allMasterItems);
      loadMasterTables();
    }
const RATE_CHART = RATES.map(r => ({
  id: r.id,
  name: r.item,
  unit: r.unit,
  rate: Number(r.rate),
  cat: r.category === "Grocery" ? "grocery" : "vegetable & others"
}));

    function normalizeRateChartName(v){
      return String(v || '').replace(/\s+/g,' ').trim().toLowerCase();
    }

    function syncRateChartIntoMasterItems() {
      // The uploaded 2026-10-03 chart is the source of truth for new rates.
      // Existing custom items are preserved; chart items are added/updated.
      RATE_CHART.forEach((r) => {
        const idx = allMasterItems.findIndex(m => normalizeRateChartName(m.name) === normalizeRateChartName(r.name));
        const mappedCat = r.cat === 'vegetable & others' ? 'veg' : 'grocery';
        if (idx >= 0) {
          allMasterItems[idx].rate = Number(r.rate);
          allMasterItems[idx].unit = r.unit;
          allMasterItems[idx].cat = mappedCat;
          allMasterItems[idx].rateChartId = r.id;
        } else {
          allMasterItems.push({
            id: r.id,
            name: r.name,
            unit: r.unit,
            rate: Number(r.rate),
            cat: mappedCat,
            rateChartId: r.id
          });
        }
      });
      saveData('allMasterItems', allMasterItems);
    }

    function getRateChartItem(name) {
      const n = normalizeRateChartName(name);
      return RATE_CHART.find(x => normalizeRateChartName(x.name) === n) || null;
    }

    function applyRateFromChart() {
      const item = getSelectedCatalogItem();
      const preview = $("ratePreview");
      const selectedUnit = $("selectedItemUnit");
      const itemPreview = $('itemSelectionPreview');
      if (item) {
        if (preview) preview.innerHTML = `<span class="font-black text-emerald-300">₹${Number(item.rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</span> / ${item.unit}`;
        if (selectedUnit) selectedUnit.textContent = item.unit;
        if (itemPreview) itemPreview.innerHTML = `<span class="item-preview-sl"><small>SL</small><b>${String(item.id || '—')}</b></span><span class="item-preview-name"><small>ITEM NAME</small><b>${String(item.name || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}</b><em>${String(item.unit || '')}</em></span><span class="item-preview-rate"><small>RATE</small><b>₹${Number(item.rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</b></span>`;
      } else {
        if (preview) preview.textContent = 'Rate: —';
        if (selectedUnit) selectedUnit.textContent = '';
        if (itemPreview) itemPreview.innerHTML = '<span class="item-preview-sl"><small>SL</small><b>—</b></span><span class="item-preview-name"><small>ITEM NAME</small><b>Select an item</b></span><span class="item-preview-rate"><small>RATE</small><b>—</b></span>';
      }
    }

    function openRateChart() {
      const modal = $("rateChartModal");
      const body = $("rateChartBody");
      if(!modal || !body) return;
      const q = (window.prompt("Search item in Rate Chart (leave blank for all items):") || "").trim().toLowerCase();
      const filtered = q ? RATE_CHART.filter(x => x.name.toLowerCase().includes(q)) : RATE_CHART;
      body.innerHTML = filtered.map((x,i) =>
        `<tr class="border-b border-white/10 hover:bg-white/5">
          <td class="px-3 py-2 text-xs opacity-60">${i+1}</td>
          <td class="px-3 py-2 font-semibold">${x.name}</td>
          <td class="px-3 py-2">${x.unit}</td>
          <td class="px-3 py-2 font-black text-emerald-300">₹ ${Number(x.rate).toLocaleString("en-IN",{maximumFractionDigits:2})}</td>
          <td class="px-3 py-2 text-[10px] opacity-60">${x.cat}</td>
        </tr>`
      ).join("") || `<tr><td colspan="5" class="p-6 text-center opacity-60">No matching item found.</td></tr>`;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    function closeRateChart() {
      const modal = $("rateChartModal");
      if(modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    }

    function getSelectedDateText() {
      const parts = activeMonthKey.split("-");
      const year = parseInt(parts[0]) || now.getFullYear();
      const month = parseInt(parts[1]) || (now.getMonth() + 1);
      const date = new Date(year, month - 1, selectedDay);
      return date.toLocaleDateString("en-IN", {day:"numeric", month:"long", year:"numeric"});
    }

    function getDeliveryKey(item) {
      if(item && item.rateChartId !== undefined && item.rateChartId !== null && item.rateChartId !== "") {
        return `rate:${item.rateChartId}`;
      }
      const chartItem = item ? getRateChartItem(item.name) : null;
      if(chartItem) return `rate:${chartItem.id}`;
      if(item && item.masterIndex !== undefined && item.masterIndex !== null && item.masterIndex !== "") {
        return `master:${item.masterIndex}`;
      }
      return `name:${normalizeRateChartName(item?.name)}|unit:${String(item?.unit || "")}`;
    }

    function getDeliveryMeta(item) {
      const chartItem = item ? (
        (item.rateChartId !== undefined && item.rateChartId !== null && item.rateChartId !== ""
          ? RATE_CHART.find(r => String(r.id) === String(item.rateChartId))
          : null) || getRateChartItem(item.name)
      ) : null;
      const masterItem = item && item.masterIndex !== undefined
        ? allMasterItems[item.masterIndex]
        : null;
      const resolved = chartItem || masterItem || {};
      return {
        sl: item?.sl ?? resolved.id ?? "",
        name: item?.name ?? resolved.name ?? "",
        unit: item?.unit ?? resolved.unit ?? "",
        rate: Number(item?.rate ?? resolved.rate ?? 0),
        cat: resolved.cat || (chartItem ? (chartItem.cat === "vegetable & others" ? "veg" : "grocery") : "grocery")
      };
    }

    // Stable Rate Chart ordering. IDs such as 1_01, 1_02 must not be compared with parseFloat(),
    // because parseFloat("1_02") === 1. Use the actual Rate Chart position as the primary key.
    function getDeliverySortKey(item) {
      const chartId = item?.rateChartId ?? item?.sl;
      const idx = chartId != null && chartId !== ""
        ? RATE_CHART.findIndex(r => String(r.id) === String(chartId))
        : -1;
      if (idx >= 0) return idx;
      if (item?.masterIndex !== undefined && Number.isFinite(Number(item.masterIndex))) return 100000 + Number(item.masterIndex);
      const name = normalizeRateChartName(item?.name || "");
      const byName = name ? RATE_CHART.findIndex(r => normalizeRateChartName(r.name) === name) : -1;
      if (byName >= 0) return byName;
      return 1000000;
    }

    function compareDeliverySerial(a, b) {
      const ka = getDeliverySortKey(a), kb = getDeliverySortKey(b);
      if (ka !== kb) return ka - kb;
      const sa = String(a?.sl ?? ""), sb = String(b?.sl ?? "");
      return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: "base" });
    }

    let currentDetailsPdfHtml = "";

    function openCostDetails() {
      if(!(currentSection === "boys" || currentSection === "girls")) return;
      openDailyDetailsForSection(currentSection, false);
    }

    function openCombinedDailyDetails() {
      selectedDay = parseInt($("combinedDaySelect")?.value || selectedDay || 1);
      openDailyDetailsForSection("combined", true);
    }

    function buildDailyDetailsHtml(section) {
      const monthData = monthlyDeliveries[activeMonthKey] || { boys: {}, girls: {} };
      const dayKey = String(selectedDay);
      let title = section === "combined" ? `Combined • ${getSelectedDateText()}` : `${section === "boys" ? "Boys" : "Girls"} • ${getSelectedDateText()}`;

      if(section !== "combined") {
        const data = ((monthData[section] || {})[dayKey]) || [];
        let total = 0;
        const rows = data.map((item, idx) => {
          const amount = Number(item.total || 0);
          total += amount;
          return {
            sl: item.sl || idx + 1, name: item.name, boys: section === "boys" ? Number(item.qty || 0) : 0,
            girls: section === "girls" ? Number(item.qty || 0) : 0, totalQty: Number(item.qty || 0), unit: item.unit, rate: Number(item.rate || 0), amount
          };
        });
        return { title, rows, total, empty: rows.length === 0 };
      }

      const boys = ((monthData.boys || {})[dayKey]) || [];
      const girls = ((monthData.girls || {})[dayKey]) || [];
      const map = {};
      boys.forEach(item => {
        const key = getDeliveryKey(item);
        if(!map[key]) {
          const meta = getDeliveryMeta(item);
          map[key] = { sl: meta.sl, name: meta.name, boys: 0, girls: 0, totalQty: 0, unit: meta.unit, rate: meta.rate, amount: 0 };
        }
        map[key].boys += Number(item.qty || 0);
        map[key].totalQty += Number(item.qty || 0);
        map[key].amount += Number(item.total ?? ((Number(item.qty || 0)) * Number(item.rate || 0)));
      });
      girls.forEach(item => {
        const key = getDeliveryKey(item);
        if(!map[key]) {
          const meta = getDeliveryMeta(item);
          map[key] = { sl: meta.sl, name: meta.name, boys: 0, girls: 0, totalQty: 0, unit: meta.unit, rate: meta.rate, amount: 0 };
        }
        map[key].girls += Number(item.qty || 0);
        map[key].totalQty += Number(item.qty || 0);
        map[key].amount += Number(item.total ?? ((Number(item.qty || 0)) * Number(item.rate || 0)));
        if(!map[key].rate) map[key].rate = Number(item.rate || 0);
      });
      const rows = Object.values(map).sort(compareDeliverySerial);
      const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      return { title, rows, total, empty: rows.length === 0 };
    }

    function openDailyDetailsForSection(section, allowCombined) {
      if(section === "combined" && !allowCombined) return;
      const details = buildDailyDetailsHtml(section);
      $("costDetailsTitle").innerText = details.title;

      if(details.empty) {
        $("costDetailsBody").innerHTML = `<div class="p-8 text-center opacity-60">No food items recorded for this day.</div>`;
        currentDetailsPdfHtml = `<h2>${details.title}</h2><p>No food items recorded for this day.</p>`;
      } else {
        const combined = section === "combined";
        const header = combined
          ? `<div class="grid grid-cols-[44px_1fr_64px_64px_64px_auto] gap-3 items-center px-2 pb-2 text-[10px] uppercase opacity-50 font-black"><div>SL</div><div>Item</div><div class="text-center">Boys</div><div class="text-center">Girls</div><div class="text-center">Total</div><div class="text-right">Amount</div></div>`
          : ``;
        const rows = details.rows.map((item, idx) => {
          const amount = Number(item.amount || 0);
          const sub = combined ? `${item.boys} + ${item.girls} = ${formatQuantity(item.totalQty)} ${item.unit} × ₹${item.rate}` : `${formatQuantity(item.totalQty)} ${item.unit} × ₹${item.rate}`;
          return combined
            ? `<div class="detail-row grid grid-cols-[44px_1fr_64px_64px_64px_auto] gap-3 items-center py-3"><div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black">${item.sl || idx+1}</div><div><div class="font-bold text-sm">${item.name}</div><div class="text-[11px] opacity-60">${sub}</div></div><div class="text-center text-sm">${item.boys ? formatQuantity(item.boys) : '-'}</div><div class="text-center text-sm">${item.girls ? formatQuantity(item.girls) : '-'}</div><div class="text-center font-black text-emerald-300">${formatQuantity(item.totalQty)}</div><div class="font-black text-sm text-right">₹${amount.toLocaleString()}</div></div>`
            : `<div class="detail-row grid grid-cols-[44px_1fr_auto] gap-3 items-center py-3"><div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black">${item.sl || idx+1}</div><div><div class="font-bold text-sm">${item.name}</div><div class="text-[11px] opacity-60">${sub}</div></div><div class="font-black text-sm">₹${amount.toLocaleString()}</div></div>`;
        }).join("");
        const totalHtml = `<div class="mt-4 pt-4 border-t border-white/10 flex justify-between font-black"><span>Total Cost</span><span class="text-emerald-300">₹${details.total.toLocaleString()}</span></div>`;
        $("costDetailsBody").innerHTML = header + rows + totalHtml;

        currentDetailsPdfHtml = buildDailyDetailsPdfHtml(details, combined);
      }
      $("costDetailsModal").classList.remove("hidden");
      $("costDetailsModal").classList.add("flex");
    }

    function buildDailyDetailsPdfHtml(details, combined) {
      const cols = combined
        ? `<tr><th>SL</th><th>Item Name</th><th>Boys</th><th>Girls</th><th>Total Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr>`
        : `<tr><th>SL</th><th>Item Name</th><th>Total Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr>`;
      const money = value => Number(value || 0).toLocaleString('en-IN', {minimumFractionDigits:0, maximumFractionDigits:2});
      const rows = details.rows.map((item, idx) => combined
        ? `<tr><td>${item.sl || idx+1}</td><td>${item.name}</td><td>${item.boys ? formatQuantity(item.boys) : '-'}</td><td>${item.girls ? formatQuantity(item.girls) : '-'}</td><td>${formatQuantity(item.totalQty)}</td><td>${item.unit}</td><td>₹${money(item.rate)}</td><td>₹${money(item.amount)}</td></tr>`
        : `<tr><td>${item.sl || idx+1}</td><td>${item.name}</td><td>${formatQuantity(item.totalQty)}</td><td>${item.unit}</td><td>₹${money(item.rate)}</td><td>₹${money(item.amount)}</td></tr>`).join('');
      const colgroup = combined ? '<colgroup><col style="width:7%"><col style="width:34%"><col style="width:9%"><col style="width:9%"><col style="width:12%"><col style="width:9%"><col style="width:10%"><col style="width:10%"></colgroup>' : '<colgroup><col style="width:8%"><col style="width:42%"><col style="width:16%"><col style="width:10%"><col style="width:12%"><col style="width:12%"></colgroup>';
      return `<h2>${details.title}</h2><table>${colgroup}<thead>${cols}</thead><tbody>${rows}</tbody></table><p class="total"><b>Total Cost: ₹${money(details.total)}</b></p>`;
    }

    function downloadDailyDetailsPdf() {
      const win = window.open('', '', 'height=700,width=900');
      if(!win) { showNotification('Please allow pop-ups for PDF generation.', 'PDF'); return; }
      const html = `<html><head><title>Daily Received Item Details</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h2{text-align:center;margin:0 0 6px}p{color:#555;text-align:center}table{width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin-top:18px;font-size:12px}th,td{border:1px solid #ccc;padding:6px;overflow-wrap:anywhere;vertical-align:middle}td:nth-child(2){text-align:left}th{background:#f2f2f2;text-align:center}.total{text-align:right;font-size:16px;color:#064e3b;margin-top:18px}@media print{body{padding:10px}}</style></head><body>${currentDetailsPdfHtml}</body></html>`;
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
    }

    function closeCostDetails() {
      $("costDetailsModal").classList.add("hidden");
      $("costDetailsModal").classList.remove("flex");
    }

    function selectSection(type) {
      currentSection = type;
      const body = document.body;
      body.classList.remove('boys-theme','girls-theme','combined-theme');
      if(type === 'boys') body.classList.add('boys-theme');
      else if(type === 'girls') body.classList.add('girls-theme');
      else if(type === 'combined') body.classList.add('combined-theme');
      $("welcomeScreen").classList.add("hidden");
      $("mainAppContainer").classList.remove("hidden");
      
      const badge = $("sidebarBadge");
      badge.className = "text-xs font-extrabold uppercase px-3 py-1 rounded-lg border bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

      if(type === 'boys' || type === 'girls') {
        $("sectionDaily").classList.remove("hidden");
        $("sectionSummary").classList.add("hidden");
        $("sectionCombined").classList.add("hidden");
        $("topNavTabsContainer").classList.remove("hidden");
        $("sidebarTitle").innerText = type === 'boys' ? "Boys" : "Girls";
        $("activeHostelTitle").innerText = type === 'boys' ? "Boys Hostel Supply" : "Girls Hostel Supply";
        $("sidebarBadge").innerText = "Portal";
        populateDayRibbon();
        filterItemsByCategory();
        loadDayData();
      } else if(type === 'combined') {
        $("sectionDaily").classList.add("hidden");
        $("sectionSummary").classList.add("hidden");
        $("sectionCombined").classList.remove("hidden");
        $("topNavTabsContainer").classList.add("hidden");
        $("sidebarTitle").innerText = "Combined";
        $("sidebarBadge").innerText = "Portal";
        populateCombinedDaySelector();
        loadCombinedData();
      }
      updateRemarksDefaultInputs();
    }

    function returnToWelcome() {
      currentSection = null;
      document.body.classList.remove('boys-theme','girls-theme','combined-theme');
      $("welcomeScreen").classList.remove("hidden");
      $("mainAppContainer").classList.add("hidden");
    }

    function switchTab(tab) {
      if(tab === 'daily') {
        $("sectionDaily").classList.remove("hidden");
        $("sectionSummary").classList.add("hidden");
        $("tabDaily").className = "px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md transition-all";
        $("tabSummary").className = "px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/5 opacity-80 transition-all";
        loadDayData();
      } else {
        $("sectionDaily").classList.add("hidden");
        $("sectionSummary").classList.remove("hidden");
        $("tabSummary").className = "px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md transition-all";
        $("tabDaily").className = "px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/5 opacity-80 transition-all";
        loadSummary();
      }
      updateRemarksDefaultInputs();
    }

    function populateDayRibbon() {
      const ribbon = $("dayRibbonContainer");
      ribbon.innerHTML = "";
      
      if(!monthlyDeliveries[activeMonthKey]) monthlyDeliveries[activeMonthKey] = { boys: {}, girls: {} };
      const hostelData = monthlyDeliveries[activeMonthKey][currentSection] || {};

      let parts = activeMonthKey.split("-");
      let year = parseInt(parts[0]) || now.getFullYear();
      let month = parseInt(parts[1]) || (now.getMonth() + 1);
      let daysInCurrentMonth = getDaysInMonth(year, month);

      for(let i = 1; i <= daysInCurrentMonth; i++) {
        let hasData = hostelData[i] && hostelData[i].length > 0;
        let isSelected = selectedDay === i;
        let btnClass = "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex flex-col items-center gap-1 border ";
        if(isSelected) btnClass += "bg-emerald-600 border-emerald-500 text-white shadow-lg scale-105";
        else if(hasData) btnClass += "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30";
        else btnClass += "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10";

        ribbon.innerHTML += `
          <button onclick="changeDay(${i})" class="${btnClass}">
            <span>${new Date(year, month - 1, i).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
             <span class="text-[10px] font-bold opacity-80">${new Date(year, month - 1, i).toLocaleDateString("en-IN",{weekday:"short"})}</span>
            ${hasData ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>' : ''}
          </button>`;
      }
    }

    function changeDay(day) {
      selectedDay = day;
      populateDayRibbon();
      loadDayData();
    }

    function filterItemsByCategory() {
      const selectedCat = $("inputCatSelect").value;
      const select = $("itemSelect");
      select.innerHTML = "";

      // Show the uploaded rate-chart items first, then any custom master items
      // that are not already present in the rate chart.
      const chartCat = selectedCat === 'veg' ? 'vegetable & others' : 'grocery';
      const chartItems = RATE_CHART.filter(item => item.cat === chartCat);
      const chartNames = new Set(chartItems.map(item => normalizeRateChartName(item.name)));
      const customItems = allMasterItems
        .map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => item.cat === selectedCat && !chartNames.has(normalizeRateChartName(item.name)));

      const options = [];
      chartItems.forEach(item => {
        options.push(`<option value="ratechart:${item.id}" data-name="${String(item.name).replace(/"/g,'&quot;')}">SL: ${item.id} | ${item.name} (${item.unit}) | ₹${Number(item.rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</option>`);
      });
      customItems.forEach(item => {
        options.push(`<option value="master:${item.originalIndex}" data-name="${String(item.name).replace(/"/g,'&quot;')}">SL: ${item.id || (item.originalIndex+1)} | ${item.name} (${item.unit}) | ₹${Number(item.rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</option>`);
      });

      if (!options.length) {
        select.innerHTML = `<option value="">-- No items found --</option>`;
        updateRatePreview();
        return;
      }

      select.innerHTML = options.join('');
      select.selectedIndex = 0;
      applyRateFromChart();
    }

    function getSelectedCatalogItem() {
      const value = $("itemSelect")?.value || '';
      if (!value) return null;
      if (value.startsWith('ratechart:')) {
        const id = value.slice('ratechart:'.length);
        return RATE_CHART.find(x => String(x.id) === String(id)) || null;
      }
      if (value.startsWith('master:')) {
        const idx = parseInt(value.slice('master:'.length), 10);
        return Number.isInteger(idx) ? allMasterItems[idx] || null : null;
      }
      return null;
    }

    function updateRatePreview() {
      const item = getSelectedCatalogItem();
      const preview = $("ratePreview");
      if (!preview) return;
      if (item) {
        preview.innerHTML = `<span class="font-black text-emerald-300">₹${Number(item.rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</span> / ${item.unit}`;
      } else {
        preview.textContent = 'Rate: —';
      }
    }

    function deleteItem(index) {
      monthlyDeliveries[activeMonthKey][currentSection][selectedDay].splice(index, 1);
      if(monthlyDeliveries[activeMonthKey][currentSection][selectedDay].length === 0) delete monthlyDeliveries[activeMonthKey][currentSection][selectedDay];
      saveData("monthlyDeliveries", monthlyDeliveries);
      populateDayRibbon();
      loadDayData();
    }

    function loadDayData() {
      const tbody = $("dayTableBody");
      tbody.innerHTML = "";
      
      if(!monthlyDeliveries[activeMonthKey]) monthlyDeliveries[activeMonthKey] = { boys: {}, girls: {} };
      const data = (monthlyDeliveries[activeMonthKey][currentSection] || {})[selectedDay] || [];
      data.sort((a, b) => a.sl - b.sl);

      const selectedDateText = getSelectedDateText();
      $("dayItemCountBadge").innerText = `${selectedDateText} • ${new Date(Number(activeMonthKey.split('-')[0]), Number(activeMonthKey.split('-')[1])-1, selectedDay).toLocaleDateString('en-IN',{weekday:'long'})}`;
      $("dashDayDateLabel").innerText = `${selectedDateText}`;
      $("dashDayDateSub").innerText = `${currentSection === "boys" ? "Boys" : "Girls"} Hostel • ${new Date(Number(activeMonthKey.split('-')[0]), Number(activeMonthKey.split('-')[1])-1, selectedDay).toLocaleDateString('en-IN',{weekday:'long'})}`;
      $("dashCostDateLabel").innerText = `${selectedDateText} • Cost`;
      $("dashDayItemCount").innerText = `${data.length} Items`;

      if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-5 text-center opacity-50">No items added for Day ${selectedDay}.</td></tr>`;
      } else {
        data.forEach((item, idx) => {
          tbody.innerHTML += `
            <tr class="border-b border-white/5">
              <td class="p-3.5 font-bold">${item.sl || (idx + 1)}</td>
              <td class="p-3.5 font-medium">${item.name}</td>
              <td class="p-3.5">
                <input type="number" min="0" step="any" value="${Math.abs(Number(item.qty)||0)}" onchange="updateItemQty(${idx}, this.value)" class="input-custom w-20 p-1 rounded text-xs font-bold"> ${item.unit}
              </td>
              <td class="p-3.5">₹${item.rate}</td>
              <td class="p-3.5 font-bold">₹${item.total}</td>
              <td class="p-3.5 text-center"><button onclick="deleteItem(${idx})" class="text-rose-400 bg-rose-500/10 px-3 py-1 rounded text-xs font-semibold">Delete</button></td>
            </tr>`;
        });
      }
      updateTotals();
    }

    function updateTotals() {
      const hostelData = (monthlyDeliveries[activeMonthKey] || {})[currentSection] || {};
      let dayCost = (hostelData[selectedDay] || []).reduce((sum, i) => sum + i.total, 0);
      $("dashDayCost").innerText = `₹ ${dayCost.toLocaleString()}`;

      let totalCost = 0;
      Object.keys(hostelData).forEach(d => hostelData[d].forEach(i => totalCost += i.total));
      $("dashTotalCost").innerText = `₹ ${totalCost.toLocaleString()}`;

      const limit = budgets[currentSection] || 15000;
      const remaining = limit - totalCost;
      let spentPercent = limit > 0 ? ((totalCost / limit) * 100).toFixed(1) : 0;
      let remainingPercentage = (100 - spentPercent).toFixed(1);

      $("dashSpentPercentage").innerText = `Spent: ${spentPercent}% of budget`;
      
      const remElem = $("dashRemainingBudget");
      const remPercElem = $("dashRemainingPercentage");
      
      remElem.innerText = `₹ ${remaining.toLocaleString()}`;
      remPercElem.innerText = `Remaining: ${remainingPercentage}%`;

      if(remaining < 0) {
        remElem.className = "text-2xl font-black mt-1 text-rose-400";
        remPercElem.className = "text-[11px] font-bold mt-1 text-rose-400";
      } else if(spentPercent > 80) {
        remElem.className = "text-2xl font-black mt-1 text-amber-400";
        remPercElem.className = "text-[11px] font-bold mt-1 text-amber-400";
      } else {
        remElem.className = "text-2xl font-black mt-1 text-emerald-400";
        remPercElem.className = "text-[11px] font-bold mt-1 text-emerald-400";
      }
    }

    function formatQuantity(value) {
      const n = Number(value || 0);
      if (!Number.isFinite(n)) return "0";
      return n.toLocaleString("en-IN", { maximumFractionDigits: 3, useGrouping: false });
    }

    function loadSummary() {
      const hostelData = (monthlyDeliveries[activeMonthKey] || {})[currentSection] || {};
      const days = Object.keys(hostelData);
      let total = 0;
      days.forEach(d => hostelData[d].forEach(i => total += i.total));

      $("sumDays").innerText = `${days.length} Days`;
      $("sumExpense").innerText = `₹ ${total.toLocaleString()}`;
      
      const limit = budgets[currentSection];
      const status = $("sumStatus");
      if(total > limit) {
        status.innerText = "Exceeded!";
        status.className = "text-2xl font-black mt-1 text-rose-400";
      } else {
        status.innerText = "Safe Limit";
        status.className = "text-2xl font-black mt-1 text-emerald-400";
      }

      const summaryBody = $("summaryTableBody");
      summaryBody.innerHTML = "";

      let aggregatedItems = {};
      Object.keys(hostelData).forEach(d => {
        hostelData[d].forEach(i => {
          let mIndex = i.masterIndex !== undefined ? i.masterIndex : 0;
          if(!aggregatedItems[mIndex]) {
            aggregatedItems[mIndex] = { 
              sl: i.sl || allMasterItems[mIndex]?.id || (parseInt(mIndex) + 1), 
              name: i.name, unit: i.unit, rate: i.rate, totalQty: 0, totalAmount: 0 
            };
          }
          aggregatedItems[mIndex].totalQty += i.qty;
          aggregatedItems[mIndex].totalAmount += i.total;
        });
      });

      let keys = Object.keys(aggregatedItems).sort((a, b) => aggregatedItems[a].sl - aggregatedItems[b].sl);
      if(keys.length === 0) {
        summaryBody.innerHTML = `<tr><td colspan="6" class="p-5 text-center opacity-50">No items recorded this month yet.</td></tr>`;
      } else {
        keys.forEach(idx => {
          let item = aggregatedItems[idx];
          summaryBody.innerHTML += `
            <tr class="border-b border-white/5">
              <td class="p-3.5 font-bold">${item.sl}</td>
              <td class="p-3.5 font-medium">${item.name}</td>
              <td class="p-3.5 text-center font-bold text-emerald-300">${formatQuantity(item.totalQty)}</td>
              <td class="p-3.5">${item.unit}</td>
              <td class="p-3.5">₹${item.rate}</td>
              <td class="p-3.5 text-right font-bold">₹${item.totalAmount.toLocaleString()}</td>
            </tr>`;
        });
      }
    }

    function populateCombinedDaySelector() {
      const select = $("combinedDaySelect");
      if(!select) return;
      const parts = activeMonthKey.split("-");
      const year = parseInt(parts[0]) || now.getFullYear();
      const month = parseInt(parts[1]) || (now.getMonth() + 1);
      const totalDays = getDaysInMonth(year, month);
      select.innerHTML = Array.from({length: totalDays}, (_, i) => {
        const day = i + 1;
        const date = new Date(year, month - 1, day);
        const dateLabel = date.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
        const weekday = date.toLocaleDateString('en-IN',{weekday:'short'});
        return `<option value="${day}" ${day === selectedDay ? 'selected' : ''}>${dateLabel} — ${weekday}</option>`;
      }).join('');
    }

    function getMonthlyExpenseForSide(side) {
      const monthData = monthlyDeliveries[activeMonthKey] || {};
      return Object.values(monthData[side] || {}).reduce((sum, rows) => sum + (Array.isArray(rows) ? rows.reduce((s, item) => s + Number(item.total ?? (Number(item.qty || 0) * Number(item.rate || 0))), 0) : 0), 0);
    }

    function updateCombinedBudgetCards() {
      const boysExpense = getMonthlyExpenseForSide('boys');
      const girlsExpense = getMonthlyExpenseForSide('girls');
      const expense = boysExpense + girlsExpense;
      const budget = Number(budgets.boys || 0) + Number(budgets.girls || 0);
      const remaining = budget - expense;
      const money = value => `₹ ${Number(value || 0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
      const percent = value => `${value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}%`;
      const expenseEl = $('combinedMonthlyExpense');
      const remainingEl = $('combinedRemainingBudget');
      const expensePercentEl = $('combinedExpensePercent');
      const remainingPercentEl = $('combinedRemainingPercent');
      const sub = $('combinedBudgetSubtext');
      if (expenseEl) expenseEl.textContent = money(expense);
      if (remainingEl) { remainingEl.textContent = money(remaining); remainingEl.classList.toggle('budget-overrun', remaining < 0); }
      if (expensePercentEl) expensePercentEl.textContent = budget > 0 ? `Budget used: ${percent((expense / budget) * 100)}` : 'Budget used: N/A';
      if (remainingPercentEl) { remainingPercentEl.textContent = budget > 0 ? `Budget remaining: ${percent((remaining / budget) * 100)}` : 'Budget remaining: N/A'; remainingPercentEl.classList.toggle('budget-overrun', remaining < 0); }
      if (sub) sub.textContent = budget <= 0 ? (expense > 0 ? `No budget set • expense ${money(expense)}` : 'No budget set') : (remaining < 0 ? `Over budget by ${money(Math.abs(remaining))}` : `Combined budget: ${money(budget)}`);
    }

    function loadCombinedData() {
      updateCombinedBudgetCards();
      const tbody = $("combinedTableBody");
      tbody.innerHTML = "";

      const monthData = monthlyDeliveries[activeMonthKey] || { boys: {}, girls: {} };
      const aggregated = {};

      const collect = (hostelData, side) => {
        Object.keys(hostelData || {}).forEach(day => {
          (hostelData[day] || []).forEach(item => {
            const key = getDeliveryKey(item);
            const meta = getDeliveryMeta(item);
            if(!aggregated[key]) {
              aggregated[key] = {
                sl: meta.sl, name: meta.name, unit: meta.unit, rate: meta.rate,
                boys: 0, girls: 0, totalQty: 0, totalAmount: 0, cat: meta.cat
              };
            }
            const qty = Number(item.qty || 0);
            const amount = Number(item.total ?? (qty * Number(item.rate || meta.rate || 0)));
            aggregated[key][side] += qty;
            aggregated[key].totalQty += qty;
            aggregated[key].totalAmount += amount;
            if(!aggregated[key].rate) aggregated[key].rate = Number(item.rate || meta.rate || 0);
          });
        });
      };

      collect(monthData.boys, "boys");
      collect(monthData.girls, "girls");

      const items = Object.values(aggregated).sort(compareDeliverySerial);

      if(items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-5 text-center opacity-50">No items received in ${activeMonthKey} yet.</td></tr>`;
      } else {
        items.forEach(item => {
          tbody.innerHTML += `
            <tr class="border-b border-emerald-500/10">
              <td class="p-3.5 font-bold">${item.sl}</td>
              <td class="p-3.5 font-medium">${item.name}</td>
              <td class="p-3.5 text-center">${item.boys ? formatQuantity(item.boys) : '-'}</td>
              <td class="p-3.5 text-center">${item.girls ? formatQuantity(item.girls) : '-'}</td>
              <td class="p-3.5 text-center font-bold text-emerald-300">${formatQuantity(item.totalQty)}</td>
              <td class="p-3.5">${item.unit}</td>
              <td class="p-3.5">₹${Number(item.rate || 0).toLocaleString('en-IN',{maximumFractionDigits:2})}</td>
              <td class="p-3.5 text-right font-bold">₹${Number(item.totalAmount || 0).toLocaleString('en-IN',{maximumFractionDigits:2})}</td>
            </tr>`;
        });
      }
      const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      $("combinedGrandTotal").innerText = `₹ ${grandTotal.toLocaleString('en-IN',{maximumFractionDigits:2})}`;
    }

    function exportToExcel() {
      if (typeof XLSX === 'undefined') {
        showNotification('Excel export library could not load. Check your internet connection and try again.', 'Excel Export');
        return;
      }
      const wb = XLSX.utils.book_new();
      const sectionKey = currentSection || 'combined';
      const sectionTitle = sectionKey === 'boys' ? 'Boys' : sectionKey === 'girls' ? 'Girls' : 'Combined';
      const fileName = `food_supply_${sectionKey}_${activeMonthKey}.xlsx`;
      const monthData = monthlyDeliveries[activeMonthKey] || { boys: {}, girls: {} };
      const [yearPart, monthPart] = activeMonthKey.split('-');
      const year = parseInt(yearPart, 10) || now.getFullYear();
      const month = parseInt(monthPart, 10) || (now.getMonth() + 1);
      const daysInMonth = getDaysInMonth(year, month);
      const remarksInput = sectionKey === 'combined' ? $('reportMonthCombinedInput') : $('reportMonthInput');
      const remarksText = remarksInput ? remarksInput.value.trim() : '';
      const navy = '17365D', blue = '1F4E78', teal = '0F766E', paleBlue = 'D9EAF7', paleGreen = 'E2F0D9', white = 'FFFFFF', gray = 'F3F6F9', dark = '263445';
      const border = { top:{style:'thin',color:{rgb:'D5DEE8'}}, bottom:{style:'thin',color:{rgb:'D5DEE8'}}, left:{style:'thin',color:{rgb:'D5DEE8'}}, right:{style:'thin',color:{rgb:'D5DEE8'}} };
      const titleStyle = {font:{name:'Aptos Display',sz:16,bold:true,color:{rgb:white}},fill:{patternType:'solid',fgColor:{rgb:navy}},alignment:{horizontal:'center',vertical:'center'},border};
      const subtitleStyle = {font:{name:'Aptos',sz:10,italic:true,color:{rgb:'44546A'}},fill:{patternType:'solid',fgColor:{rgb:'EAF0F6'}},alignment:{horizontal:'left',vertical:'center'},border};
      const headerStyle = {font:{name:'Aptos',sz:10,bold:true,color:{rgb:white}},fill:{patternType:'solid',fgColor:{rgb:blue}},alignment:{horizontal:'center',vertical:'center',wrapText:true},border};
      const totalStyle = {font:{name:'Aptos',sz:10,bold:true,color:{rgb:dark}},fill:{patternType:'solid',fgColor:{rgb:paleGreen}},alignment:{vertical:'center'},border};
      const moneyFormat = '₹#,##0.00;[Red]-₹#,##0.00;–';
      const qtyFormat = '#,##0.###;[Red]-#,##0.###;–';
      const styleWorksheet = (ws, opts={}) => {
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        const headerRow = opts.headerRow ?? 3;
        for (let R=range.s.r; R<=range.e.r; R++) {
          for (let C=range.s.c; C<=range.e.c; C++) {
            const ref = XLSX.utils.encode_cell({r:R,c:C});
            const cell = ws[ref];
            if (!cell) continue;
            cell.s = cell.s || {};
            cell.s.border = border;
            cell.s.font = {name:'Aptos',sz:10,...(cell.s.font||{})};
            cell.s.alignment = {vertical:'center',...(cell.s.alignment||{})};
            if (R===0) cell.s = {...titleStyle, ...cell.s, fill:titleStyle.fill, font:titleStyle.font, alignment:titleStyle.alignment, border};
            else if (R===1) cell.s = {...subtitleStyle, ...cell.s, fill:subtitleStyle.fill, font:subtitleStyle.font, border};
            else if (R===headerRow) cell.s = {...headerStyle, ...cell.s, fill:headerStyle.fill, font:headerStyle.font, alignment:headerStyle.alignment, border};
            else if (opts.totalRow === R) cell.s = {...totalStyle, ...cell.s, fill:totalStyle.fill, font:totalStyle.font, border};
            else if (R>headerRow && (R-headerRow)%2===0) cell.s.fill = {patternType:'solid',fgColor:{rgb:'F7F9FC'}};
            if (cell.t==='n' && /Qty|Quantity|Day \d+/i.test(String((ws[XLSX.utils.encode_cell({r:headerRow,c:C})]||{}).v||''))) cell.z = qtyFormat;
          }
        }
        ws['!freeze'] = {xSplit:opts.freezeCols ?? 2,ySplit:headerRow+1,topLeftCell:XLSX.utils.encode_cell({r:headerRow+1,c:opts.freezeCols??2}),activePane:'bottomRight',state:'frozen'};
        ws['!pageSetup'] = {paperSize:9,orientation:opts.orientation||'landscape',fitToWidth:1,fitToHeight:0};
        ws['!margins'] = {left:0.25,right:0.25,top:0.5,bottom:0.5,header:0.2,footer:0.2};
        ws['!autofilter'] = {ref:XLSX.utils.encode_range({s:{r:headerRow,c:0},e:{r:range.e.r,c:range.e.c}})};
        ws['!rows'] = ws['!rows'] || [];
        ws['!rows'][0] = {hpt:28}; ws['!rows'][headerRow] = {hpt:32};
      };
      const appendStyledSheet = (name, rows, widths, opts={}) => {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = widths.map(w => ({wch:w}));
        if (!ws['!merges']) ws['!merges'] = [];
        const lastCol = Math.max(0, widths.length-1);
        if (rows.length) ws['!merges'].push({s:{r:0,c:0},e:{r:0,c:lastCol}});
        if (rows[1] && rows[1].length) ws['!merges'].push({s:{r:1,c:0},e:{r:1,c:lastCol}});
        styleWorksheet(ws, opts);
        XLSX.utils.book_append_sheet(wb, ws, name);
        return ws;
      };

      // Aggregate monthly item summary, preserving original quantities and amounts.
      const aggregated = {};
      const collect = (hostelData, side) => Object.keys(hostelData || {}).forEach(day => {
        (hostelData[day] || []).forEach(item => {
          const meta = getDeliveryMeta(item), key = getDeliveryKey(item);
          if (!aggregated[key]) aggregated[key] = {sl:meta.sl,name:meta.name,unit:meta.unit,rate:Number(item.rate ?? meta.rate ?? 0),boys:0,girls:0,totalQty:0,totalAmount:0,days:{}};
          const qty = Number(item.qty || 0), rate = Number(item.rate ?? meta.rate ?? 0);
          aggregated[key][side] += qty; aggregated[key].totalQty += qty;
          aggregated[key].totalAmount += Number(item.total ?? qty*rate);
          aggregated[key].days[Number(day)] = (aggregated[key].days[Number(day)] || 0) + qty;
        });
      });
      if (sectionKey === 'combined' || sectionKey === 'boys') collect(monthData.boys, 'boys');
      if (sectionKey === 'combined' || sectionKey === 'girls') collect(monthData.girls, 'girls');
      const items = Object.values(aggregated).sort(compareDeliverySerial);
      const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const title = `${sectionTitle} Hostel Food Supply Report — ${monthNames[month-1]} ${year}`;

      if (sectionKey === 'combined') {
        const summaryRows = [[title], [remarksText || 'Monthly consolidated item-wise summary'], [], ['SL','Item Name','Boys Qty','Girls Qty','Total Qty','Unit','Rate (₹)','Amount (₹)']];
        items.forEach(i => summaryRows.push([i.sl,i.name,i.boys||0,i.girls||0,i.totalQty,i.unit,i.rate,i.totalAmount]));
        const totalRowIndex = summaryRows.length;
        summaryRows.push(['','','','','','','Grand Total',grandTotal]);
        const ws = appendStyledSheet('Item Summary',summaryRows,[8,30,14,14,14,12,15,18],{headerRow:3,totalRow:totalRowIndex,freezeCols:2,orientation:'landscape'});
        for(let r=4;r<totalRowIndex;r++){['C','D','E'].forEach(c=>{if(ws[c+(r+1)])ws[c+(r+1)].z=qtyFormat;});if(ws['G'+(r+1)])ws['G'+(r+1)].z=moneyFormat;if(ws['H'+(r+1)])ws['H'+(r+1)].z=moneyFormat;}
        if(ws['H'+(totalRowIndex+1)])ws['H'+(totalRowIndex+1)].z=moneyFormat;
      } else {
        const header = ['SL','Item Name',...Array.from({length:daysInMonth},(_,i)=>`Day ${i+1}`),'Total Qty','Unit','Rate (₹)','Amount (₹)'];
        const rows = [[title],[remarksText || `${sectionTitle} portal monthly day-wise quantity`],[],header];
        items.forEach(i=>rows.push([i.sl,i.name,...Array.from({length:daysInMonth},(_,d)=>i.days[d+1]||''),i.totalQty,i.unit,i.rate,i.totalAmount]));
        const totalRowIndex=rows.length, totalRow=['','Grand Total:',...Array(daysInMonth).fill(''),'','','',grandTotal];rows.push(totalRow);
        const widths=[7,27,...Array(daysInMonth).fill(9),13,10,14,17];
        const ws=appendStyledSheet(`${sectionTitle} Monthly`,rows,widths,{headerRow:3,totalRow:totalRowIndex,freezeCols:2,orientation:'landscape'});
        const qtyStart=3, qtyEnd=2+daysInMonth;
        for(let r=4;r<totalRowIndex;r++){
          for(let c=qtyStart;c<=qtyEnd;c++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&cell.t==='n')cell.z=qtyFormat;}
          const totalCell=ws[XLSX.utils.encode_cell({r,c:daysInMonth+3})];if(totalCell)totalCell.z=qtyFormat;
          const rateCell=ws[XLSX.utils.encode_cell({r,c:daysInMonth+5})];if(rateCell)rateCell.z=moneyFormat;
          const amountCell=ws[XLSX.utils.encode_cell({r,c:daysInMonth+6})];if(amountCell)amountCell.z=moneyFormat;
        }
        const totalAmountCell=ws[XLSX.utils.encode_cell({r:totalRowIndex,c:daysInMonth+6})];if(totalAmountCell)totalAmountCell.z=moneyFormat;
      }

      // Detailed ledger sheet: one row per saved item/day, useful for filters and audit.
      const detailRows=[[`${sectionTitle} Food Supply — Daily Transaction Register`],[remarksText || `Detailed records for ${monthNames[month-1]} ${year}`],[],['Date','Portal','SL','Item Name','Category','Quantity','Unit','Rate (₹)','Amount (₹)','Entry Type']];
      ['boys','girls'].filter(side=>sectionKey==='combined'||side===sectionKey).forEach(side=>{
        Object.keys(monthData[side]||{}).sort((a,b)=>Number(a)-Number(b)).forEach(day=>{
          (monthData[side][day]||[]).forEach(item=>{
            const meta=getDeliveryMeta(item), qty=Number(item.qty||0), rate=Number(item.rate??meta.rate??0);
            const dt=`${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
            detailRows.push([dt,side==='boys'?'Boys':'Girls',item.sl||meta.sl,item.name||meta.name,meta.cat||item.category||'',qty,item.unit||meta.unit||'',rate,Number(item.total??qty*rate),item.entryType||'Received']);
          });
        });
      });
      if(detailRows.length===4) detailRows.push(['No transaction data','','','','','','','','','']);
      const detailWs=appendStyledSheet('Daily Details',detailRows,[14,12,8,28,16,13,10,14,17,16],{headerRow:3,freezeCols:4,orientation:'landscape'});
      for(let r=4;r<detailRows.length;r++){
        const q=detailWs['F'+(r+1)], rate=detailWs['H'+(r+1)], amount=detailWs['I'+(r+1)];
        if(q)q.z=qtyFormat;if(rate)rate.z=moneyFormat;if(amount)amount.z=moneyFormat;
      }
      // Executive totals sheet for quick office review.
      const portalTotal = (side) => Object.values(monthData[side]||{}).reduce((sum,arr)=>sum+(arr||[]).reduce((s,i)=>s+Number(i.total??Number(i.qty||0)*Number(i.rate||0)),0),0);
      const boysTotal=sectionKey==='girls'?0:portalTotal('boys'), girlsTotal=sectionKey==='boys'?0:portalTotal('girls');
      const summary=[['Food Supply — Executive Summary'],[`${monthNames[month-1]} ${year} | ${sectionTitle} Portal`],[],['Metric','Value'],['Portal',sectionTitle],['Reporting Month',`${monthNames[month-1]} ${year}`],['Unique Items',items.length],['Boys Total (₹)',boysTotal],['Girls Total (₹)',girlsTotal],['Grand Total (₹)',grandTotal]];
      const sumWs=XLSX.utils.aoa_to_sheet(summary);sumWs['!cols']=[{wch:28},{wch:28}];sumWs['!merges']=[{s:{r:0,c:0},e:{r:0,c:1}},{s:{r:1,c:0},e:{r:1,c:1}}];
      for(let r=0;r<summary.length;r++)for(let c=0;c<2;c++){const cell=sumWs[XLSX.utils.encode_cell({r,c})];if(!cell)continue;cell.s={font:{name:'Aptos',sz:11,color:{rgb:dark}},alignment:{vertical:'center'},border};if(r===0)cell.s={...titleStyle,fill:titleStyle.fill,font:titleStyle.font,alignment:titleStyle.alignment,border};else if(r===1)cell.s={...subtitleStyle,fill:subtitleStyle.fill,font:subtitleStyle.font,border};else if(r===3)cell.s={...headerStyle,fill:headerStyle.fill,font:headerStyle.font,alignment:headerStyle.alignment,border};else if(r>=7)cell.s={...totalStyle,fill:totalStyle.fill,font:totalStyle.font,border};}
      ['B8','B9','B10'].forEach(ref=>{if(sumWs[ref])sumWs[ref].z=moneyFormat;});sumWs['!rows']=[{hpt:28},{hpt:22}];sumWs['!pageSetup']={paperSize:9,orientation:'portrait',fitToWidth:1,fitToHeight:1};
      XLSX.utils.book_append_sheet(wb,sumWs,'Executive Summary');
      XLSX.writeFile(wb,fileName,{cellStyles:true});
    }

    function repairDeliveryItemIndexes() {
      let changed = false;
      Object.values(monthlyDeliveries || {}).forEach(month => {
        ['boys','girls'].forEach(section => {
          Object.values((month && month[section]) || {}).forEach(dayItems => {
            (dayItems || []).forEach(item => {
              if (Number.isInteger(item.masterIndex) && allMasterItems[item.masterIndex]) return;
              let idx = -1;
              if (item.rateChartId) idx = allMasterItems.findIndex(m => String(m.rateChartId || '') === String(item.rateChartId));
              if (idx < 0 && item.name) idx = allMasterItems.findIndex(m => normalizeRateChartName(m.name) === normalizeRateChartName(item.name));
              if (idx >= 0) {
                item.masterIndex = idx;
                const chart = getRateChartItem(item.name);
                if (chart) {
                  item.rateChartId = chart.id;
                  item.sl = String(chart.id);
                  item.unit = chart.unit;
                  item.rate = Number(chart.rate);
                  item.total = Number(item.qty || 0) * Number(chart.rate);
                }
                changed = true;
              }
            });
          });
        });
      });
      if (changed) saveData('monthlyDeliveries', monthlyDeliveries);
    }

    window.onload = function() {
      syncRateChartIntoMasterItems();
      repairDeliveryItemIndexes();
      initPeriodSelectors();
    };

// Apply saved theme after all controls are available.
window.addEventListener("load", () => { try { applyThemeToDocument(appTheme); syncThemeInputs(); } catch(e) {} });
/* === Food Supply 2026-10 final enhancement layer === */
(function(){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=(v,d=0)=>{const n=parseFloat(v);return Number.isFinite(n)?n:d;};
  const entryModes=['quick','grid','repeat','import'];
  let currentEntryMode=localStorage.getItem('foodSupplyEntryMode')||'quick';

  function findCatalogByName(name){
    const n=normalizeRateChartName(name);
    const chart=RATE_CHART.find(x=>normalizeRateChartName(x.name)===n);
    if(chart)return chart;
    const idx=allMasterItems.findIndex(x=>normalizeRateChartName(x.name)===n);
    return idx>=0?{...allMasterItems[idx],originalIndex:idx}:null;
  }
  function rememberItem(name){let a=JSON.parse(localStorage.getItem('foodSupplyRecentItems')||'[]');a=[name,...a.filter(x=>x!==name)].slice(0,15);localStorage.setItem('foodSupplyRecentItems',JSON.stringify(a));refreshRecentItems();}
  function refreshRecentItems(){const s=$('recentItemSelect');if(!s)return;const a=JSON.parse(localStorage.getItem('foodSupplyRecentItems')||'[]');s.innerHTML='<option value="">Recent items…</option>'+a.slice(0,10).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');}
  function refreshRepeatDays(){const s=$('repeatSourceDay');if(!s)return;const [y,m]=activeMonthKey.split('-').map(Number),total=getDaysInMonth(y,m);s.innerHTML='';for(let d=1;d<=total;d++){if(d===selectedDay)continue;const o=document.createElement('option');o.value=d;o.textContent=`Day ${d}`;s.appendChild(o);}}
  function ensureDayBucket(){if(!monthlyDeliveries[activeMonthKey])monthlyDeliveries[activeMonthKey]={boys:{},girls:{}};if(!monthlyDeliveries[activeMonthKey][currentSection])monthlyDeliveries[activeMonthKey][currentSection]={};if(!monthlyDeliveries[activeMonthKey][currentSection][selectedDay])monthlyDeliveries[activeMonthKey][currentSection][selectedDay]=[];return monthlyDeliveries[activeMonthKey][currentSection][selectedDay];}
  function pushEntry(item,qty,entryType='Received',signOverride=1){const catalog=findCatalogByName(item.name||item);if(!catalog)return{ok:false,error:`Item not found: ${item.name||item}`};const rawQty=String(qty??'').trim();const q=Number(rawQty);if(rawQty===''||!Number.isFinite(q)||q<0)return{ok:false,error:`Quantity must be a valid non-negative number: ${catalog.name}`};if(q===0)return{ok:false,error:`Quantity is zero: ${catalog.name}`};let sign=signOverride;if(entryType==='Return')sign=-1;if((entryType==='Correction'||entryType==='Adjustment')&&num(item.sign,1)<0)sign=-1;const rate=Number(catalog.rate||0),unit=catalog.unit||'Kg',chart=getRateChartItem(catalog.name),stableIndex=allMasterItems.findIndex(m=>normalizeRateChartName(m.name)===normalizeRateChartName(catalog.name));const row={masterIndex:stableIndex,rateChartId:chart?.id||catalog.rateChartId||null,sl:String(chart?.id||catalog.id||0),name:catalog.name,qty:q*sign,unit,rate,total:q*sign*rate,entryType};const bucket=ensureDayBucket();const dup=bucket.find(x=>normalizeRateChartName(x.name)===normalizeRateChartName(row.name)&&x.entryType===row.entryType);if(dup&&!window.confirm(`এই দিনে ${row.name} ইতিমধ্যেই আছে। নতুন entry যোগ করবেন?`))return{ok:false,cancelled:true};bucket.push(row);bucket.sort(compareDeliverySerial);rememberItem(row.name);saveData('monthlyDeliveries',monthlyDeliveries);return{ok:true,row};}

  function addEntryPanelHTML(){const panel=$('entryModePanel');if(!panel)return;panel.innerHTML=`
    <div id="quickEntryTools" class="space-y-3"><div class="flex flex-wrap gap-2 items-center"><span class="text-[10px] font-bold opacity-60">Quick Qty:</span>${[0.1,0.3,0.5,1,2,5,10,20,50,100].map(x=>`<button type="button" onclick="setQuickQty(${x})" class="quick-qty-btn">${x}</button>`).join('')}<button type="button" onclick="focusItemSearch()" class="quick-qty-btn">🔎 Search</button></div><div class="text-[10px] opacity-70">Quick entry uses the item, quantity and the selected Boys/Girls portal. Rate and unit come automatically from the rate chart.</div></div>
    <div id="gridEntryTools" class="hidden space-y-2"><div class="flex flex-wrap gap-2 items-center justify-between"><span class="text-[10px] opacity-70">Enter quantities directly. Blank rows remain blank.</span><button type="button" onclick="saveGridEntries()" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black">✓ Save All</button></div><div id="gridEntryTable" class="overflow-x-auto rounded-xl border border-white/10"></div></div>
    <div id="repeatEntryTools" class="hidden grid grid-cols-1 md:grid-cols-4 gap-2"><div><label class="text-[10px] opacity-60">Copy From Day</label><select id="repeatSourceDay" class="input-custom w-full p-2.5 rounded-xl text-xs mt-1"></select></div><div><label class="text-[10px] opacity-60">Copy To</label><div class="input-custom w-full p-2.5 rounded-xl text-xs mt-1">Day ${selectedDay}</div></div><div><label class="text-[10px] opacity-60">Source</label><select id="repeatSourceSide" class="input-custom w-full p-2.5 rounded-xl text-xs mt-1"><option value="current">Current portal</option><option value="boys">Boys</option><option value="girls">Girls</option></select></div><div class="flex items-end"><button type="button" onclick="copyRepeatEntries()" class="w-full bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl text-xs font-black">↻ Copy Entries</button></div></div>
    <div id="importEntryTools" class="hidden space-y-2"><div class="text-[10px] opacity-70">Excel/CSV columns: Item, Quantity, optional Category.</div><div class="flex flex-col sm:flex-row gap-2"><input id="entryImportFile" type="file" accept=".xlsx,.xls,.csv" class="input-custom p-2.5 rounded-xl text-xs flex-1"><button type="button" onclick="importEntryFile()" class="bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 px-5 rounded-xl text-xs font-black">⇧ Import Rows</button></div></div>`;refreshRepeatDays();refreshRecentItems();}
  function renderGrid(){const box=$('gridEntryTable');if(!box)return;const cat=$('inputCatSelect')?.value||'grocery';const arr=RATE_CHART.filter(x=>(cat==='grocery'?x.cat==='grocery':x.cat!=='grocery'));box.innerHTML=`<table class="w-full text-xs"><thead><tr class="bg-white/5"><th class="p-2">SL</th><th class="p-2 text-left">Item</th><th class="p-2">Unit</th><th class="p-2">Rate</th><th class="p-2">Boys Qty</th><th class="p-2">Girls Qty</th></tr></thead><tbody>${arr.map((x,i)=>`<tr class="border-t border-white/10"><td class="p-2">${x.id||i+1}</td><td class="p-2 font-bold">${esc(x.name)}</td><td class="p-2 text-center">${esc(x.unit)}</td><td class="p-2 text-center">₹${num(x.rate).toLocaleString('en-IN')}</td><td class="p-2"><input type="number" min="0" step="any" data-grid-item="${esc(x.name)}" data-grid-side="boys" class="input-custom w-full p-2 rounded-lg text-xs" placeholder="—"></td><td class="p-2"><input type="number" min="0" step="any" data-grid-item="${esc(x.name)}" data-grid-side="girls" class="input-custom w-full p-2 rounded-lg text-xs" placeholder="—"></td></tr>`).join('')}</tbody></table>`;}

  window.setEntryMode=function(mode){if(!entryModes.includes(mode))mode='quick';currentEntryMode=mode;localStorage.setItem('foodSupplyEntryMode',mode);document.querySelectorAll('.entry-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.entryMode===mode));['quick','grid','repeat','import'].forEach(x=>{const el=$(`${x}EntryTools`);if(el)el.classList.toggle('hidden',x!==mode);});if(mode==='repeat')refreshRepeatDays();if(mode==='grid')renderGrid();};
  window.setQuickQty=q=>{const e=$('itemQtyInput');if(e){e.value=q;e.focus();}};window.focusItemSearch=()=>{$('itemSelect')?.focus()};window.selectRecentItem=name=>{if(!name)return;const f=[...$('itemSelect').options].find(o=>normalizeRateChartName(o.textContent)===normalizeRateChartName(name));if(f){$('itemSelect').value=f.value;applyRateFromChart();}};
  window.addDeliveryItem=function(){const value=$('itemSelect')?.value||'';if(!value){showNotification('Please select a valid item!','Warning');return false;}const item=getSelectedCatalogItem();if(!item){showNotification('Selected item could not be found in the rate chart/master list.','Warning');return false;}let type='Received',sign=1;if(currentEntryMode==='adjustment'){type=$('adjustmentType')?.value||'Received';sign=num($('adjustmentSign')?.value,1);}const r=pushEntry({name:item.name,sign},$('itemQtyInput').value,type,sign);if(!r.ok){if(!r.cancelled)showNotification(r.error||'Could not save entry.','Warning');return false;}$('itemQtyInput').value='';populateDayRibbon();loadDayData();applyRateFromChart();return true;};
  window.saveGridEntries=function(){let ok=0,bad=[];document.querySelectorAll('[data-grid-item]').forEach(inp=>{if(inp.value==='')return;const side=inp.dataset.gridSide,name=inp.dataset.gridItem;const old=currentSection;currentSection=side;const r=pushEntry({name},inp.value,'Received',1);if(r.ok)ok++;else if(r.error)bad.push(`${name}: ${r.error}`);currentSection=old;inp.value='';});saveData('monthlyDeliveries',monthlyDeliveries);populateDayRibbon();loadDayData();showNotification(`${ok} grid item(s) saved.${bad.length?' Rejected: '+bad.slice(0,4).join('; '):''}`,'Grid Entry');};
  window.copyRepeatEntries=function(){const sourceSide=$('repeatSourceSide')?.value||'current',side=sourceSide==='current'?currentSection:sourceSide,sourceDay=num($('repeatSourceDay')?.value,0),source=((monthlyDeliveries[activeMonthKey]||{})[side]||{})[sourceDay]||[];if(!side||!sourceDay)return;if(!source.length){showNotification(`Day ${sourceDay} has no entries.`,'Repeat / Copy');return;}const dest=ensureDayBucket();let copied=0;source.forEach(x=>{if(!dest.some(y=>y.name===x.name&&y.entryType===x.entryType)){dest.push(JSON.parse(JSON.stringify(x)));copied++;}});dest.sort(compareDeliverySerial);saveData('monthlyDeliveries',monthlyDeliveries);populateDayRibbon();loadDayData();showNotification(`${copied} item(s) copied to Day ${selectedDay}.`,'Repeat / Copy');};
  window.importEntryFile=function(){const file=$('entryImportFile')?.files?.[0];if(!file){showNotification('Select an Excel/CSV file first.','Import');return;}if(typeof XLSX==='undefined'){showNotification('Excel engine could not load.','Import Error');return;}const reader=new FileReader();reader.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});let ok=0,bad=[];rows.forEach((r,i)=>{const name=r.Item||r['Item Name']||r.Name||r.item||'',qty=r.Quantity??r.Qty??r.quantity??r.qty??'';if(!name||qty===''){bad.push(`row ${i+2}`);return;}const res=pushEntry({name},qty,'Received',1);if(res.ok)ok++;else bad.push(res.error||`row ${i+2}`);});saveData('monthlyDeliveries',monthlyDeliveries);populateDayRibbon();loadDayData();showNotification(`${ok} row(s) imported.${bad.length?' Not imported: '+bad.slice(0,6).join('; '):''}`,'Import Complete');}catch(err){console.error(err);showNotification('The selected file could not be read.','Import Error');}};reader.readAsArrayBuffer(file);};
  window.updateItemQty=function(index,newQty){const item=monthlyDeliveries?.[activeMonthKey]?.[currentSection]?.[selectedDay]?.[index];if(!item)return;const rawText=String(newQty??'').trim(),raw=Number(rawText);if(rawText===''||!Number.isFinite(raw)||raw<0){showNotification('Quantity must be a valid non-negative number.','Invalid Quantity');loadDayData();return;}const sign=item.qty<0?-1:1;item.qty=raw*sign;item.total=item.qty*Number(item.rate||0);saveData('monthlyDeliveries',monthlyDeliveries);loadDayData();};

  // PDF REPORT ENGINE: build from saved data first, then render/download.
  function collectPdfReport(type){
    const sectionKey=type==='combined'?'combined':(currentSection||'boys');
    const layout=$(type==='combined'?'pdfLayoutSelectCombined':'pdfLayoutSelect')?.value||'separate';
    const md=monthlyDeliveries[activeMonthKey]||{boys:{},girls:{}};
    const sides=sectionKey==='combined'?['boys','girls']:[sectionKey];
    const agg={};
    sides.forEach(side=>{
      Object.values(md[side]||{}).forEach(items=>{
        (Array.isArray(items)?items:[]).forEach(i=>{
          const catalog=getRateChartItem(i.name);
          const key=String(i.rateChartId||catalog?.id||i.name);
          if(!agg[key]) agg[key]={sl:i.sl||catalog?.id||'',rateChartId:i.rateChartId||catalog?.id||null,masterIndex:i.masterIndex,name:i.name||'',unit:i.unit||catalog?.unit||'',rate:Number(catalog?.rate??i.rate??0),boys:0,girls:0,qty:0,amount:0,cat:catalog?.cat||'grocery'};
          const q=num(i.qty,0), rate=Number(catalog?.rate??i.rate??0);
          agg[key][side]+=q; agg[key].qty+=q; agg[key].amount+=q*rate;
        });
      });
    });
    const items=Object.values(agg).filter(x=>x.name && Math.abs(x.qty)>0).sort(compareDeliverySerial);
    return {sectionKey,layout,items,grocery:items.filter(x=>x.cat==='grocery'),vegetable:items.filter(x=>x.cat!=='grocery')};
  }

  function makePdfReportHtml(report){
    const combined=report.sectionKey==='combined';
    const money=x=>num(x).toLocaleString('en-IN',{maximumFractionDigits:2});
    const qty=x=>num(x).toLocaleString('en-IN',{maximumFractionDigits:3,useGrouping:false});
    const table=arr=>`<table><colgroup>${(combined?['7%','31%','9%','9%','12%','9%','11%','12%']:['8%','38%','15%','10%','13%','16%']).map((w,i)=>`<col style="width:${w}">`).join('')}</colgroup><thead><tr><th>SL</th><th>Item Name</th>${combined?'<th>Boys Qty</th><th>Girls Qty</th>':''}<th>Total Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${arr.map(i=>`<tr><td>${esc(i.sl)}</td><td class="item-name">${esc(i.name)}</td>${combined?`<td>${qty(i.boys)}</td><td>${qty(i.girls)}</td>`:''}<td>${qty(i.qty)}</td><td>${esc(i.unit)}</td><td>₹${money(i.rate)}</td><td>₹${money(i.amount)}</td></tr>`).join('')}</tbody></table>`;
    const gt=report.grocery.reduce((s,x)=>s+x.amount,0), vt=report.vegetable.reduce((s,x)=>s+x.amount,0), grand=gt+vt;
    let body='';
    if(report.grocery.length) body+=`<section class="pdf-section"><h3>Grocery</h3>${table(report.grocery)}<div class="subtotal">Grocery Grand Total: ₹${money(gt)}</div></section>`;
    if(report.vegetable.length) body+=`<section class="${report.layout==='separate'?'pdf-vegetable-separate':'pdf-section-continuous'}"><h3>Vegetable &amp; Others</h3>${table(report.vegetable)}<div class="subtotal">Vegetable &amp; Others Grand Total: ₹${money(vt)}</div></section>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Food Supply Report</title><style>@page{size:A4 ${combined?'landscape':'portrait'};margin:9mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;background:#fff;font-size:9.5px;margin:0;padding:0}h1{text-align:center;font-size:18px;margin:0 0 4px}h2{text-align:center;font-size:11px;color:#555;margin:0 0 12px}h3{font-size:13px;border-bottom:2px solid #222;padding-bottom:4px;margin:9px 0 6px}table{width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 8px;page-break-inside:auto}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}th,td{border:1px solid #aeb7c2;padding:4px 5px;vertical-align:middle;overflow-wrap:anywhere;word-break:normal}th{background:#e8edf3;text-align:center;font-size:9px}td{text-align:right}td:nth-child(2){text-align:left}.item-name{white-space:normal;overflow-wrap:anywhere}.pdf-section{break-inside:auto}.pdf-vegetable-separate{break-before:page;page-break-before:always}.pdf-section-continuous{break-before:auto;page-break-before:auto}.subtotal{text-align:right;font-weight:700;margin:5px 0 12px}.grand{page-break-inside:avoid;text-align:right;font-size:14px;font-weight:800;border-top:2px solid #222;padding-top:7px;margin-top:9px}</style></head><body><h1>${esc(report.sectionKey==='combined'?'Combined Food Supply Report':report.sectionKey==='boys'?'Boys Food Supply Report':'Girls Food Supply Report')}</h1><h2>${esc(activeMonthKey)} • ${esc(report.sectionKey==='combined'?'Boys + Girls':report.sectionKey)} • ${esc(report.layout)}</h2>${body}<div class="grand">Combined Grand Total: ₹${money(grand)}</div></body></html>`;
  }

  // PDF PREVIEW: open a review window first; download/print is done from that window.
  window.printReport=function(type){
    // Open the preview window immediately while still inside the user's click event.
    // This is important for Android Chrome/PWA, where a delayed popup can be blocked.
    let previewWin=null;
    try{
      previewWin=window.open('about:blank','_blank','width=1100,height=850');
      if(!previewWin){
        showNotification('Popup blocked. Please allow pop-ups for PDF Preview and try again.','PDF');
        return;
      }
      previewWin.document.open();
      previewWin.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Food Supply PDF Preview</title></head><body style="font-family:Arial,sans-serif;padding:30px;text-align:center">Preparing PDF Preview…</body></html>');
      previewWin.document.close();

      const report=collectPdfReport(type);
      if(!report.items.length){
        try{previewWin.close();}catch(e){}
        showNotification(`No saved data found for ${activeMonthKey}. Please enter/save at least one item before creating the PDF.`,'PDF');
        return;
      }
      const baseHtml=makePdfReportHtml(report);
      const filename=`food_supply_${report.sectionKey}_${activeMonthKey}.pdf`;

      const toolbar=`
        <div id="pdfPreviewToolbar" style="position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:#0f172a;color:#fff;box-shadow:0 2px 12px rgba(0,0,0,.25);font-family:Arial,sans-serif;">
          <div style="font-size:14px;font-weight:800;">📄 Food Supply — PDF Preview</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            <button id="downloadPdfBtn" type="button" style="border:0;border-radius:8px;padding:9px 13px;background:#059669;color:#fff;font-weight:800;cursor:pointer;">⬇ Download PDF</button>
            <button id="printPdfBtn" type="button" style="border:0;border-radius:8px;padding:9px 13px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer;">🖨 Print / Save as PDF</button>
            <button id="closePdfBtn" type="button" style="border:0;border-radius:8px;padding:9px 13px;background:#475569;color:#fff;font-weight:800;cursor:pointer;">✕ Close</button>
          </div>
        </div>
        <div id="pdfPreviewStatus" style="font-family:Arial,sans-serif;font-size:12px;color:#475569;background:#f8fafc;padding:7px 16px;text-align:center;">Review the report below, then choose Download PDF or Print / Save as PDF.</div>`;

      const bodyContent=baseHtml.substring(baseHtml.indexOf('<body>')+6,baseHtml.lastIndexOf('</body>'));
      const reportStyleMatch=baseHtml.match(/<style>([\s\S]*?)<\/style>/i);
      const reportCss=reportStyleMatch?reportStyleMatch[1]:'';
      const previewHtml=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Food Supply PDF Preview</title><script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script><style>${reportCss}</style><style>html,body{margin:0;padding:0;background:#e5e7eb}#pdfPreviewContent{width:${report.sectionKey==='combined'?'297mm':'210mm'};max-width:calc(100vw - 24px);margin:18px auto;background:#fff;padding:10mm;box-sizing:border-box;box-shadow:0 4px 24px rgba(0,0,0,.18)}@media(max-width:700px){#pdfPreviewContent{width:auto;margin:10px;padding:7mm;box-shadow:none}#pdfPreviewToolbar{position:sticky!important}.pdf-preview-btn{font-size:11px}}@media print{#pdfPreviewToolbar,#pdfPreviewStatus{display:none!important}html,body{background:#fff!important}#pdfPreviewContent{width:auto;max-width:none;margin:0;box-shadow:none;padding:0}}</style></head><body>${toolbar}<div id="pdfPreviewContent">${bodyContent}</div><script>
        const filename=${JSON.stringify(filename)};
        const content=document.getElementById('pdfPreviewContent');
        const status=document.getElementById('pdfPreviewStatus');
        document.getElementById('closePdfBtn').onclick=()=>window.close();
        document.getElementById('printPdfBtn').onclick=()=>window.print();
        document.getElementById('downloadPdfBtn').onclick=async()=>{
          const btn=document.getElementById('downloadPdfBtn');
          btn.disabled=true; btn.style.opacity='.65'; status.textContent='Preparing PDF download…';
          try{
            if(typeof html2pdf==='undefined') throw new Error('PDF engine unavailable');
            await html2pdf().set({margin:10,filename,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#fff',logging:false},jsPDF:{unit:'mm',format:'a4',orientation:${report.sectionKey==='combined'?'landscape':'portrait'}},pagebreak:{mode:['css','legacy']}}).from(content).save();
            status.textContent='PDF downloaded successfully.';
          }catch(err){
            console.error(err); status.textContent='Direct download was unavailable. Opening Print / Save as PDF…';
            setTimeout(()=>window.print(),150);
          }finally{btn.disabled=false;btn.style.opacity='1';}
        };
        <\/script></body></html>`;

      previewWin.document.open();
      previewWin.document.write(previewHtml);
      previewWin.document.close();
      showNotification('PDF Preview opened. Review it before saving.','PDF');
    }catch(err){
      console.error('PDF preview failed',err);
      showNotification('PDF Preview could not be opened. Please try again.','PDF Error');
    }
  };


  // Fixed password: 2013, stored as a hash and requested only once on first launch.
  async function sha256(v){if(window.crypto?.subtle){const b=new TextEncoder().encode(v),h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');}return v;}
  window.backToTop=function(){
    const main=document.getElementById('portalScrollMain') || document.querySelector('#mainAppContainer main');
    const smooth={top:0,left:0,behavior:'smooth'};
    if(main){
      try{main.scrollTo(smooth);}catch(e){main.scrollTop=0;}
      main.scrollTop=0;
    }
    try{window.scrollTo(smooth);}catch(e){window.scrollTo(0,0);}
    if(document.scrollingElement) document.scrollingElement.scrollTop=0;
    // A second frame catches browsers that recalculate the flex scroll area after the click.
    requestAnimationFrame(()=>{
      if(main) main.scrollTop=0;
      if(document.scrollingElement) document.scrollingElement.scrollTop=0;
    });
  };

  async function ensureSecurity(){const expected=await sha256('2013');const existing=localStorage.getItem('foodSupplySecurityHash');if(existing===expected)return;const modal=document.createElement('div');modal.id='initialSecurityModal';modal.className='fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4';modal.innerHTML=`<div class="glass max-w-sm w-full p-7 rounded-3xl border border-emerald-500/30 text-center space-y-4"><div class="text-4xl">🔐</div><h2 class="text-xl font-black">App Password</h2><p class="text-xs opacity-70">Enter the fixed app password once. It will not be requested again for Boys, Girls or Combined portals.</p><input id="fixedAppPassword" inputmode="numeric" maxlength="4" type="password" class="input-custom w-full p-3 rounded-xl text-center text-lg tracking-[.4em]" placeholder="Password"><button id="verifyFixedPassword" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black">Unlock App</button></div>`;document.body.appendChild(modal);$('verifyFixedPassword').onclick=async()=>{if($('fixedAppPassword').value.trim()!=='2013'){showNotification('Incorrect password.','Security');return;}localStorage.setItem('foodSupplySecurityHash',expected);modal.remove();showNotification('Security verified. It will not be requested again for each portal.','Security');};}

  // Appearance: portal-specific backgrounds plus user-selectable global style/mode.
  const presets={
    soft:{boys:['#122b49','#0b1728'],girls:['#431b36','#201323'],combined:['#0b3933','#101f2a'],settings:['#2b1d4b','#111827']},
    ocean:{boys:['#123b70','#0b1b37'],girls:['#4a1b3d','#25152a'],combined:['#07534b','#0d2730'],settings:['#30265e','#141b37']},
    rose:{boys:['#123c55','#10233a'],girls:['#541b3a','#2b1528'],combined:['#12453e','#122a32'],settings:['#48235d','#20172f']},
    midnight:{boys:['#081a36','#0f2a56'],girls:['#2a0d22','#4a1239'],combined:['#062a28','#0b4a43'],settings:['#1d1038','#32155f']},
    aurora:{boys:['#10224b','#251449'],girls:['#43163f','#1c1747'],combined:['#063b3c','#17214c'],settings:['#21134c','#0d3446']}
  };
  const validLandingStyles=['cards','glass','minimal','aurora','split','compact','bold','workspace'];
  function getLandingStyle(){const saved=localStorage.getItem('foodSupplyLandingStyle')||'cards';if(validLandingStyles.includes(saved))return saved;localStorage.setItem('foodSupplyLandingStyle','cards');return 'cards';}
  function syncAppearanceStatus(){
    const mode=localStorage.getItem('foodSupplyAppearance')||'dark',preset=localStorage.getItem('foodSupplyThemePreset')||'soft';
    const labels={light:'☀️ Light',dark:'🌙 Dark',auto:'🔄 Auto'},names={soft:'Soft',ocean:'Ocean',rose:'Rose',midnight:'Midnight',aurora:'Aurora'};
    document.querySelectorAll('.theme-option-btn[data-appearance]').forEach(b=>b.classList.toggle('active',b.dataset.appearance===mode));
    document.querySelectorAll('.theme-preset-btn[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===preset));
    const landingNames={cards:'Modern Cards',glass:'Glass Premium',minimal:'Clean Professional',aurora:'Aurora Glow',split:'Editorial Split',compact:'Compact Tiles',bold:'Bold Gradient',workspace:'Horizontal Workspace'};
    const landingStyle=getLandingStyle();
    const el=$('appearanceStatus');if(el)el.innerHTML=`Appearance: <b>${labels[mode]||mode}</b> &nbsp;•&nbsp; Theme: <b>${names[preset]||preset}</b> &nbsp;•&nbsp; Landing: <b>${landingNames[landingStyle]||landingStyle}</b>`;
    document.querySelectorAll('.landing-design-option[data-landing-option]').forEach(b=>{const active=b.dataset.landingOption===landingStyle;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const bg=$('backgroundStyleSelect');if(bg)bg.value=localStorage.getItem('foodSupplyBackgroundStyle')||'gradient';
    const scope=$('portalThemeScope');if(scope)scope.value=localStorage.getItem('foodSupplyThemeScope')||'separate';
    const ls=$('landingStyleSelect');if(ls)ls.value=getLandingStyle();
    const cc=$('customAccentColor');if(cc)cc.value=localStorage.getItem('foodSupplyCustomAccent')||themeAccents[preset]||'#10b981';
  }
  const themeAccents={soft:'#10b981',ocean:'#0ea5e9',rose:'#e11d74',midnight:'#8b5cf6',aurora:'#14b8a6'};
  const portalAccents={soft:{boys:'#60a5fa',girls:'#f472b6',combined:'#34d399',settings:'#a78bfa'},ocean:{boys:'#38bdf8',girls:'#fb7185',combined:'#2dd4bf',settings:'#a78bfa'},rose:{boys:'#7dd3fc',girls:'#fb7185',combined:'#4ade80',settings:'#d8b4fe'},midnight:{boys:'#818cf8',girls:'#f472b6',combined:'#2dd4bf',settings:'#c4b5fd'},aurora:{boys:'#60a5fa',girls:'#e879f9',combined:'#2dd4bf',settings:'#a78bfa'}};
  const lightPortalPairs={
    soft:{boys:['#eff6ff','#f8fafc'],girls:['#fdf2f8','#fff7fb'],combined:['#ecfdf5','#f8fafc'],settings:['#f5f3ff','#f8fafc']},
    ocean:{boys:['#e0f2fe','#f0f9ff'],girls:['#fce7f3','#fff7fb'],combined:['#cffafe','#f0fdfa'],settings:['#ede9fe','#f5f3ff']},
    rose:{boys:['#e0f2fe','#f8fafc'],girls:['#ffe4e6','#fff1f2'],combined:['#d1fae5','#f0fdf4'],settings:['#fae8ff','#fff7fb']},
    midnight:{boys:['#e0e7ff','#eef2ff'],girls:['#fce7f3','#fff1f2'],combined:['#d1fae5','#ecfdf5'],settings:['#ede9fe','#f5f3ff']},
    aurora:{boys:['#dbeafe','#eff6ff'],girls:['#fae8ff','#fdf4ff'],combined:['#ccfbf1','#ecfeff'],settings:['#e0e7ff','#f5f3ff']}
  };
  function effectiveAppearance(mode){
    const selected=mode||localStorage.getItem('foodSupplyAppearance')||'dark';
    return selected==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):selected;
  }
  function applyPortalBg(){
    const b=document.body;
    const preset=localStorage.getItem('foodSupplyThemePreset')||'soft';
    const p=presets[preset]||presets.soft;
    const type=currentSection||'combined';
    const key=type==='boys'?'boys':type==='girls'?'girls':type==='combined'?'combined':'settings';
    const mode=localStorage.getItem('foodSupplyAppearance')||'dark';
    const effective=effectiveAppearance(mode);
    const portalPairs=effective==='light'?(lightPortalPairs[preset]||lightPortalPairs.soft):p;
    const themePair=localStorage.getItem('foodSupplyThemeScope')==='same'?portalPairs.combined:portalPairs[key];
    b.style.setProperty('--portal-bg1',themePair[0]);
    b.style.setProperty('--portal-bg2',themePair[1]);
    b.dataset.backgroundStyle=localStorage.getItem('foodSupplyBackgroundStyle')||'gradient';
    b.dataset.themePreset=preset;
    b.dataset.appearance=mode;
    b.dataset.effectiveAppearance=effective;

    // Separate mode uses a distinct accent for each portal. Same mode uses the global/custom accent.
    const customAccent=localStorage.getItem('foodSupplyCustomAccent')||'';
    const scope=localStorage.getItem('foodSupplyThemeScope')||'separate';
    const accent=scope==='separate'?(portalAccents[preset]?.[key]||portalAccents.soft[key]):(/^#[0-9a-fA-F]{6}$/.test(customAccent)?customAccent:(themeAccents[preset]||themeAccents.soft));
    b.style.setProperty('--portal-accent',accent);
    const rgb=accent.match(/[0-9a-fA-F]{2}/g).map(v=>parseInt(v,16)).join(', ');
    b.style.setProperty('--portal-accent-rgb',rgb);
    b.style.setProperty('--focus-ring',`rgba(${rgb}, .42)`);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=effective==='light'?themePair[0]:(themePair[0]||'#0f172a');
    const landing=document.getElementById('welcomeScreen');
    if(landing){landing.dataset.landingStyle=getLandingStyle();landing.dataset.backgroundStyle=b.dataset.backgroundStyle;}
    document.querySelectorAll('[data-settings-category]').forEach(btn=>{const active=btn.dataset.settingsCategory===(document.querySelector('[data-settings-category].active')?.dataset.settingsCategory||'appearance');btn.classList.toggle('active',active);});
    document.documentElement.classList.toggle('dark',effective==='dark');
    syncAppearanceStatus();
  }
  window.setAppThemePreset=p=>{
    if(!presets[p])return;
    localStorage.setItem('foodSupplyThemePreset',p);
    // Choosing a preset must reset custom accent overrides so its button colors are obvious.
    localStorage.removeItem('foodSupplyCustomAccent');
    // Don't let a previously selected Aurora background mask the next theme selection.
    localStorage.setItem('foodSupplyBackgroundStyle',p==='aurora'?'aurora':'gradient');
    applyPortalBg();
  };
  window.setAppAppearance=mode=>{
    if(!['light','dark','auto'].includes(mode))return;
    localStorage.setItem('foodSupplyAppearance',mode);
    applyPortalBg();
  };
  window.setBackgroundStyle=style=>{if(!['solid','gradient','aurora'].includes(style))return;localStorage.setItem('foodSupplyBackgroundStyle',style);applyPortalBg();};
  window.setPortalThemeScope=scope=>{if(!['same','separate'].includes(scope))return;localStorage.setItem('foodSupplyThemeScope',scope);applyPortalBg();};
  window.setLandingStyle=style=>{if(!validLandingStyles.includes(style))return;localStorage.setItem('foodSupplyLandingStyle',style);applyPortalBg();};
  window.setCustomAccentColor=color=>{if(!/^#[0-9a-fA-F]{6}$/.test(color))return;localStorage.setItem('foodSupplyCustomAccent',color);applyPortalBg();};
  window.addEventListener('load',()=>{try{addEntryPanelHTML();setEntryMode(currentEntryMode);setAppAppearance(localStorage.getItem('foodSupplyAppearance')||'dark');applyPortalBg();}catch(e){console.error(e)};ensureSecurity();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});});
  window.addEventListener('click',e=>{if(e.target.closest('[onclick*="openLandingSettings"]'))setTimeout(applyPortalBg,20);});
  const oldSetSection=window.setSection; if(oldSetSection){window.setSection=function(...args){const r=oldSetSection.apply(this,args);setTimeout(applyPortalBg,0);return r;};}
  const oldSelectSection=window.selectSection; if(oldSelectSection){window.selectSection=function(...args){const r=oldSelectSection.apply(this,args);setTimeout(applyPortalBg,0);return r;};}
  document.addEventListener('keydown',event=>{const input=event.target;if(input instanceof HTMLInputElement&&input.type==='number'&&(event.key==='-'||event.key==='Subtract'))event.preventDefault();},true);
  document.addEventListener('input',event=>{const input=event.target;if(!(input instanceof HTMLInputElement)||input.type!=='number')return;if(input.value.trim()!==''&&Number(input.value)<0){input.value='';input.setCustomValidity('Negative values are not allowed.');input.reportValidity();}else input.setCustomValidity('');},true);
  window.addEventListener('storage',applyPortalBg);
  if(window.matchMedia){const mq=window.matchMedia('(prefers-color-scheme: dark)');const onSystemAppearanceChange=()=>{if((localStorage.getItem('foodSupplyAppearance')||'dark')==='auto')applyPortalBg();};if(mq.addEventListener)mq.addEventListener('change',onSystemAppearanceChange);else if(mq.addListener)mq.addListener(onSystemAppearanceChange);}
})();


// Two-theme selector. It intentionally leaves the approved tribal background file untouched.
(function(){
  const themeNames={tribal:'Tribal Theme',modern:'Modern Professional Theme'};
  function applyChosenTheme(mode){
    if(!['tribal','modern'].includes(mode)) mode='tribal';
    localStorage.setItem('foodSupplyAppTheme',mode);
    document.body.dataset.appTheme=mode;
    document.querySelectorAll('[data-app-theme-choice]').forEach(btn=>{
      const active=btn.dataset.appThemeChoice===mode;
      btn.setAttribute('aria-pressed',String(active));btn.classList.toggle('active',active);
    });
    const status=document.getElementById('appearanceStatus');
    if(status) status.textContent='Active theme: '+themeNames[mode];
    // Re-apply the selected theme after legacy portal switching changes CSS variables.
    document.body.style.setProperty('--portal-accent',mode==='tribal'?'#9b4f25':'#2459a9');
    document.body.style.setProperty('--portal-accent-rgb',mode==='tribal'?'155, 79, 37':'36, 89, 169');
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=mode==='tribal'?'#9b4f25':'#2459a9';
  }
  window.setAppThemeMode=applyChosenTheme;
  window.addEventListener('DOMContentLoaded',()=>applyChosenTheme(localStorage.getItem('foodSupplyAppTheme')||'tribal'));
  window.addEventListener('load',()=>applyChosenTheme(localStorage.getItem('foodSupplyAppTheme')||'tribal'));
  window.addEventListener('storage',e=>{if(e.key==='foodSupplyAppTheme')applyChosenTheme(e.newValue||'tribal');});
})();
