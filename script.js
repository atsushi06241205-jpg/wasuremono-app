const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

// 保存してあるデータを読み込む
let items = JSON.parse(localStorage.getItem("items")) || [];

function saveItems() {
  localStorage.setItem("items", JSON.stringify(items));
}

function displayItems() {
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;

    checkbox.addEventListener("change", function () {
      items[index].checked = checkbox.checked;
      saveItems();
    });

    const span = document.createElement("span");
    span.textContent = item.name;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "deleteButton";

    deleteButton.addEventListener("click", function () {
      items.splice(index, 1);
      saveItems();
      displayItems();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    itemList.appendChild(li);
  });
}

addButton.addEventListener("click", function () {
  const itemName = itemInput.value.trim();

  if (itemName === "") {
    alert("持ち物を入力してください");
    return;
  }

  items.push({
    name: itemName,
    checked: false
  });

  saveItems();

  itemInput.value = "";

  displayItems();
});

// ページを開いた時に表示
displayItems();
const homeNav = document.getElementById("homeNav");
const scheduleNav = document.getElementById("scheduleNav");

const homePage = document.getElementById("homePage");
const schedulePage = document.getElementById("schedulePage");
const settingsPage = document.getElementById("settingsPage");
const settingsNav = document.getElementById("settingsNav");

homeNav.addEventListener("click", function () {
  homePage.classList.remove("hidden");
  schedulePage.classList.add("hidden");
  settingsPage.classList.add("hidden");
  settingsNav.classList.remove("active");

  homeNav.classList.add("active");
  scheduleNav.classList.remove("active");
  displayTodaySchedules();
});

scheduleNav.addEventListener("click", function () {
  homePage.classList.add("hidden");
  schedulePage.classList.remove("hidden");
  settingsPage.classList.add("hidden");
  settingsNav.classList.remove("active");

  scheduleNav.classList.add("active");
  homeNav.classList.remove("active");
  displaySchedules();
});

settingsNav.addEventListener("click", function () {
  homePage.classList.add("hidden");
  schedulePage.classList.add("hidden");
  settingsPage.classList.remove("hidden");
  homeNav.classList.remove("active");
  scheduleNav.classList.remove("active");
  settingsNav.classList.add("active");
});

const historyPage = document.getElementById("historyPage");
const historyNav = document.getElementById("historyNav");
for (const nav of [homeNav, scheduleNav, settingsNav]) {
  nav.addEventListener("click", function () {
    historyPage.classList.add("hidden");
    historyNav.classList.remove("active");
  });
}
historyNav.addEventListener("click", function () {
  for (const page of [homePage, schedulePage, settingsPage]) page.classList.add("hidden");
  for (const nav of [homeNav, scheduleNav, settingsNav]) nav.classList.remove("active");
  historyPage.classList.remove("hidden");
  historyNav.classList.add("active");
  displayForgottenHistory();
});
let forgottenHistory = [];
try {
  const saved = JSON.parse(localStorage.getItem("forgottenHistory"));
  if (Array.isArray(saved)) forgottenHistory = saved.filter(record => record &&
    typeof record.date === "string" && typeof record.schedule === "string" && typeof record.name === "string");
} catch {
  document.getElementById("historyStatus").textContent = "忘れ物履歴を読み込めませんでした。";
}

// 表示する月は、必ず1日を基準にする（月末からの移動による月のずれを防ぐ）。
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const currentDate = new Date();
let displayedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const scheduleInput = document.getElementById("scheduleInput");
const scheduleItemsInput = document.getElementById("scheduleItemsInput");
const scheduleList = document.getElementById("scheduleList");
const scheduleStatus = document.getElementById("scheduleStatus");

// UTCへの変換を避け、端末の年月日をそのまま保存用キーにする。
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

let selectedDate = dateKey(currentDate);
let schedules = {};
try {
  const saved = JSON.parse(localStorage.getItem("schedules"));
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    for (const [key, entries] of Object.entries(saved)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(entries)) {
        // 以前の「予定名だけ」の形式も、持ち物付きの形式として読み込む。
        schedules[key] = entries.flatMap(entry => {
          if (typeof entry === "string") return [{ name: entry, belongings: [] }];
          if (!entry || typeof entry.name !== "string") return [];
          return [{
            name: entry.name,
            belongings: Array.isArray(entry.belongings) ? entry.belongings
              .filter(item => item && typeof item.name === "string")
              .map(item => ({ name: item.name, checked: item.checked === true })) : []
          }];
        });
      }
    }
  }
} catch {
  scheduleStatus.textContent = "保存済みの予定を読み込めませんでした。";
}

function saveSchedules(nextSchedules) {
  try {
    localStorage.setItem("schedules", JSON.stringify(nextSchedules));
    schedules = nextSchedules;
    scheduleStatus.textContent = "";
    document.getElementById("homeScheduleStatus").textContent = "";
    displayTodaySchedules();
    return true;
  } catch {
    scheduleStatus.textContent = "予定を保存できませんでした。ブラウザの保存設定や空き容量を確認してください。";
    document.getElementById("homeScheduleStatus").textContent = scheduleStatus.textContent;
    return false;
  }
}

function displaySchedules() {
  const [year, month, day] = selectedDate.split("-").map(Number);
  const weekday = "日月火水木金土"[new Date(year, month - 1, day).getDay()];
  document.getElementById("selectedDateHeading").textContent = `${year}年${month}月${day}日（${weekday}）`;
  const entries = schedules[selectedDate] || [];
  document.getElementById("scheduleEmpty").hidden = entries.length > 0;
  scheduleList.innerHTML = "";
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = entry.name;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "deleteButton";
    deleteButton.textContent = "削除";
    deleteButton.setAttribute("aria-label", `${entry.name}を削除`);
    deleteButton.addEventListener("click", function () {
      const remaining = entries.filter((_, entryIndex) => entryIndex !== index);
      const nextSchedules = { ...schedules, [selectedDate]: remaining };
      if (remaining.length === 0) delete nextSchedules[selectedDate];
      if (saveSchedules(nextSchedules)) {
        displaySchedules();
        displayCalendar();
      }
    });
    const header = document.createElement("div");
    header.className = "schedule-entry-header";
    header.appendChild(label);
    header.appendChild(deleteButton);
    li.appendChild(header);

    const form = document.createElement("form");
    form.className = "belongings-form";
    const inputLabel = document.createElement("label");
    inputLabel.textContent = "必要な持ち物（1行に1つ）";
    const input = document.createElement("textarea");
    input.rows = 3;
    input.maxLength = 2000;
    input.value = entry.belongings.map(item => item.name).join("\n");
    inputLabel.appendChild(input);
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "save-belongings";
    saveButton.textContent = "持ち物を保存";
    form.appendChild(inputLabel);
    form.appendChild(saveButton);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const belongings = parseBelongings(input.value, entry.belongings);
      const updated = entries.map((item, entryIndex) => entryIndex === index ? { ...item, belongings } : item);
      if (saveSchedules({ ...schedules, [selectedDate]: updated })) {
        displaySchedules();
        scheduleStatus.textContent = "持ち物を保存しました。";
      }
    });
    li.appendChild(form);
    scheduleList.appendChild(li);
  });
}

document.getElementById("scheduleForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const name = scheduleInput.value.trim();
  if (!name) {
    scheduleInput.setCustomValidity("予定の名前を入力してください");
    scheduleInput.reportValidity();
    return;
  }
  const entry = { name, belongings: parseBelongings(scheduleItemsInput.value) };
  const nextSchedules = { ...schedules, [selectedDate]: [...(schedules[selectedDate] || []), entry] };
  if (saveSchedules(nextSchedules)) {
    scheduleInput.value = "";
    scheduleItemsInput.value = "";
    displaySchedules();
    displayCalendar();
    scheduleInput.focus();
  }
});
scheduleInput.addEventListener("input", function () {
  scheduleInput.setCustomValidity("");
});

function displayCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  calendarMonth.textContent = `${year}年${month + 1}月`;
  calendarDays.innerHTML = "";

  const weekCount = Math.ceil((firstWeekday + daysInMonth) / 7);
  for (let week = 0; week < weekCount; week++) {
    const row = document.createElement("tr");

    for (let weekday = 0; weekday < 7; weekday++) {
      const cell = document.createElement("td");
      const day = week * 7 + weekday - firstWeekday + 1;

      if (day >= 1 && day <= daysInMonth) {
        const key = dateKey(new Date(year, month, day));
        const dayLabel = document.createElement("button");
        dayLabel.type = "button";
        dayLabel.className = "calendar-day";
        dayLabel.textContent = day;
        const hasSchedules = (schedules[key] || []).length > 0;
        dayLabel.setAttribute("aria-label", `${year}年${month + 1}月${day}日${hasSchedules ? "、予定あり" : ""}`);
        dayLabel.setAttribute("aria-pressed", String(key === selectedDate));
        if (key === selectedDate) dayLabel.classList.add("selected");
        if (hasSchedules) dayLabel.classList.add("has-schedules");
        dayLabel.addEventListener("click", function () {
          selectedDate = key;
          scheduleInput.value = "";
          scheduleItemsInput.value = "";
          scheduleInput.setCustomValidity("");
          displaySchedules();
          displayCalendar();
          // 再描画後も、キーボード操作のフォーカスを選択日に戻す。
          calendarDays.querySelector('[aria-pressed="true"]').focus();
        });
        if (weekday === 0) cell.classList.add("sunday");
        if (weekday === 6) cell.classList.add("saturday");

        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
          dayLabel.classList.add("today");
          dayLabel.setAttribute("aria-current", "date");
        }

        cell.appendChild(dayLabel);
      }

      row.appendChild(cell);
    }

    calendarDays.appendChild(row);
  }
}

document.getElementById("prevMonth").addEventListener("click", function () {
  displayedMonth.setMonth(displayedMonth.getMonth() - 1);
  displayCalendar();
});

document.getElementById("nextMonth").addEventListener("click", function () {
  displayedMonth.setMonth(displayedMonth.getMonth() + 1);
  displayCalendar();
});

document.getElementById("todayButton").addEventListener("click", function () {
  const today = new Date();
  displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  displayCalendar();
});

displayCalendar();
displaySchedules();
displayTodaySchedules();

// 空行と同じ名前の重複を取り除き、編集時は既存のチェックを引き継ぐ。
function parseBelongings(text, previous = []) {
  return [...new Set(text.split(/\r?\n/).map(name => name.trim()).filter(Boolean))]
    .map(name => ({ name, checked: previous.some(item => item.name === name && item.checked) }));
}

function displayTodaySchedules() {
  const container = document.getElementById("todayScheduleList");
  container.innerHTML = "";
  const todayKey = dateKey(new Date());
  const entries = schedules[todayKey] || [];
  const forgottenCounts = new Map();
  forgottenHistory.forEach(record => {
    forgottenCounts.set(record.name, (forgottenCounts.get(record.name) || 0) + 1);
  });
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "schedule-hint";
    empty.textContent = "今日の予定はありません。「予定」で登録できます。";
    container.appendChild(empty);
    return;
  }
  entries.forEach((entry, entryIndex) => {
    const card = document.createElement("section");
    card.className = "today-schedule-card";
    const heading = document.createElement("h3");
    heading.textContent = entry.name;
    card.appendChild(heading);
    if (!entry.belongings.length) {
      const hint = document.createElement("p");
      hint.className = "schedule-hint";
      hint.textContent = "持ち物は未登録です。「予定」で追加できます。";
      card.appendChild(hint);
    }
    // 元の位置を保持して並べ替え、チェック時に正しい持ち物を更新する。
    const prioritizedItems = entry.belongings.map((item, itemIndex) => ({
      item, itemIndex, count: forgottenCounts.get(item.name) || 0
    })).sort((a, b) => b.count - a.count || a.itemIndex - b.itemIndex);
    prioritizedItems.forEach(({ item, itemIndex, count }) => {
      const label = document.createElement("label");
      label.className = "scheduled-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.checked;
      const name = document.createElement("span");
      name.textContent = item.name;
      checkbox.addEventListener("change", function () {
        const updated = entries.map((schedule, index) => index === entryIndex ? {
          ...schedule,
          belongings: schedule.belongings.map((belonging, index) => index === itemIndex
            ? { ...belonging, checked: checkbox.checked } : belonging)
        } : schedule);
        if (!saveSchedules({ ...schedules, [todayKey]: updated })) checkbox.checked = item.checked;
      });
      label.appendChild(checkbox);
      label.appendChild(name);
      if (count > 0) {
        const badge = document.createElement("small");
        badge.className = "forgotten-count";
        badge.textContent = `過去に${count}回忘れた`;
        name.appendChild(badge);
      }
      const row = document.createElement("div");
      row.className = "scheduled-item-row";
      row.appendChild(label);
      const forgot = document.createElement("button");
      forgot.type = "button";
      forgot.className = "forgot-button";
      const recorded = forgottenHistory.some(record => record.date === todayKey && record.schedule === entry.name && record.name === item.name);
      forgot.textContent = recorded ? "記録済み" : "忘れた";
      forgot.disabled = recorded;
      forgot.setAttribute("aria-label", `${entry.name}の${item.name}を忘れ物として記録`);
      forgot.addEventListener("click", function () {
        if (saveForgottenHistory([...forgottenHistory, { date: todayKey, schedule: entry.name, name: item.name }])) {
          document.getElementById("homeScheduleStatus").textContent = `「${item.name}」を記録しました。履歴画面で取り消せます。`;
        }
      });
      row.appendChild(forgot);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}

// 日付をまたいで開いていた場合も、ホームへ戻る時と再表示時に更新する。
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) displayTodaySchedules();
});

// テンプレートには名前だけを保存し、予定へは独立した持ち物としてコピーする。
const templateNameInput = document.getElementById("templateNameInput");
const templateItemsInput = document.getElementById("templateItemsInput");
const templateStatus = document.getElementById("templateStatus");
const templateSelect = document.getElementById("templateSelect");
let templates = [];
let editingTemplateIndex = null;
try {
  const saved = JSON.parse(localStorage.getItem("templates"));
  if (Array.isArray(saved)) {
    templates = saved.filter(entry => entry && typeof entry.name === "string" && Array.isArray(entry.items))
      .map(entry => ({ name: entry.name, items: [...new Set(entry.items.filter(name => typeof name === "string" && name.trim()).map(name => name.trim()))] }));
  }
} catch {
  templateStatus.textContent = "保存済みのテンプレートを読み込めませんでした。";
}

function saveTemplates(nextTemplates) {
  try {
    localStorage.setItem("templates", JSON.stringify(nextTemplates));
    templates = nextTemplates;
    return true;
  } catch {
    templateStatus.textContent = "保存できませんでした。ブラウザの保存設定や空き容量を確認してください。";
    return false;
  }
}

function resetTemplateForm() {
  editingTemplateIndex = null;
  templateNameInput.value = "";
  templateItemsInput.value = "";
  templateNameInput.setCustomValidity("");
  templateItemsInput.setCustomValidity("");
  document.getElementById("templateFormHeading").textContent = "テンプレートを作成";
  document.getElementById("cancelTemplateButton").hidden = true;
}

function displayTemplates() {
  const list = document.getElementById("templateList");
  list.innerHTML = "";
  document.getElementById("templateEmpty").hidden = templates.length > 0;
  templateSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = templates.length ? "テンプレートを選択" : "「テンプレート」画面で作成してください";
  templateSelect.appendChild(placeholder);
  templateSelect.value = "";
  templateSelect.disabled = templates.length === 0;
  document.getElementById("applyTemplateButton").disabled = true;
  templates.forEach((template, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = template.name;
    templateSelect.appendChild(option);
    const li = document.createElement("li");
    const heading = document.createElement("h3");
    heading.textContent = template.name;
    const contents = document.createElement("p");
    contents.className = "template-contents";
    contents.textContent = template.items.join("\n");
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "編集";
    edit.setAttribute("aria-label", `${template.name}を編集`);
    edit.addEventListener("click", function () {
      editingTemplateIndex = index;
      templateNameInput.value = template.name;
      templateItemsInput.value = template.items.join("\n");
      templateNameInput.setCustomValidity("");
      templateItemsInput.setCustomValidity("");
      document.getElementById("templateFormHeading").textContent = "テンプレートを編集";
      document.getElementById("cancelTemplateButton").hidden = false;
      templateStatus.textContent = "";
      templateNameInput.focus();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "削除";
    remove.setAttribute("aria-label", `${template.name}を削除`);
    remove.addEventListener("click", function () {
      if (saveTemplates(templates.filter((_, entryIndex) => entryIndex !== index))) {
        resetTemplateForm();
        displayTemplates();
        templateStatus.textContent = "テンプレートを削除しました。登録済みの予定の持ち物はそのままです。";
      }
    });
    li.appendChild(heading);
    li.appendChild(contents);
    li.appendChild(edit);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

for (const input of [templateNameInput, templateItemsInput]) {
  input.addEventListener("input", function () { input.setCustomValidity(""); });
}

document.getElementById("templateForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const name = templateNameInput.value.trim();
  const names = parseBelongings(templateItemsInput.value).map(item => item.name);
  if (!name || templates.some((template, index) => index !== editingTemplateIndex && template.name === name)) {
    templateNameInput.setCustomValidity(name ? "同じ名前のテンプレートがあります" : "名前を入力してください");
    templateNameInput.reportValidity();
    return;
  }
  if (!names.length) {
    templateItemsInput.setCustomValidity("持ち物を1つ以上入力してください");
    templateItemsInput.reportValidity();
    return;
  }
  const next = templates.slice();
  const template = { name, items: names };
  if (editingTemplateIndex === null) next.push(template);
  else next[editingTemplateIndex] = template;
  if (saveTemplates(next)) {
    resetTemplateForm();
    displayTemplates();
    templateStatus.textContent = "テンプレートを保存しました。「予定」で呼び出せます。";
  }
});

document.getElementById("cancelTemplateButton").addEventListener("click", function () {
  resetTemplateForm();
  templateStatus.textContent = "";
});
templateSelect.addEventListener("change", function () {
  document.getElementById("applyTemplateButton").disabled = templateSelect.value === "";
});
document.getElementById("applyTemplateButton").addEventListener("click", function () {
  if (templateSelect.value === "") return;
  const template = templates[Number(templateSelect.value)];
  if (!template) return;
  scheduleItemsInput.value = parseBelongings([scheduleItemsInput.value, ...template.items].join("\n"))
    .map(item => item.name).join("\n");
  if (!scheduleInput.value.trim()) scheduleInput.value = template.name;
  scheduleInput.setCustomValidity("");
  scheduleStatus.textContent = `「${template.name}」の持ち物を入力欄に追加しました。「予定を追加」で保存できます。`;
});
displayTemplates();

function saveForgottenHistory(nextHistory) {
  try {
    localStorage.setItem("forgottenHistory", JSON.stringify(nextHistory));
  } catch {
    const message = "忘れ物履歴を保存できませんでした。ブラウザの保存設定や空き容量を確認してください。";
    document.getElementById("historyStatus").textContent = message;
    document.getElementById("homeScheduleStatus").textContent = message;
    return false;
  }
  forgottenHistory = nextHistory;
  document.getElementById("historyStatus").textContent = "";
  document.getElementById("homeScheduleStatus").textContent = "";
  displayForgottenHistory();
  displayTodaySchedules();
  return true;
}

function displayForgottenHistory() {
  const list = document.getElementById("forgottenList");
  const ranking = document.getElementById("forgottenRanking");
  list.innerHTML = "";
  ranking.innerHTML = "";
  document.getElementById("historyEmpty").hidden = forgottenHistory.length > 0;
  const counts = new Map();
  forgottenHistory.forEach(record => counts.set(record.name, (counts.get(record.name) || 0) + 1));
  [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .forEach(([name, count]) => {
      const li = document.createElement("li");
      li.textContent = `${name}：${count}回`;
      ranking.appendChild(li);
    });
  // 日付が同じ場合は、後から記録したものを先に表示する。
  forgottenHistory.map((record, index) => ({ record, index }))
    .sort((a, b) => b.record.date.localeCompare(a.record.date) || b.index - a.index)
    .forEach(({ record, index }) => {
      const li = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = `${record.date} / ${record.schedule}\n${record.name}`;
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.textContent = "取り消す";
      cancel.className = "deleteButton";
      cancel.setAttribute("aria-label", `${record.date}の${record.name}の記録を取り消す`);
      cancel.addEventListener("click", function () {
        if (saveForgottenHistory(forgottenHistory.filter((_, recordIndex) => recordIndex !== index))) {
          document.getElementById("historyStatus").textContent = "記録を取り消しました。";
        }
      });
      li.appendChild(text);
      li.appendChild(cancel);
      list.appendChild(li);
    });
}

displayForgottenHistory();

const weatherButton = document.getElementById("weatherSuggestButton");
const weatherStatus = document.getElementById("weatherStatus");
const locationWeatherButton = document.getElementById("locationWeatherButton");
weatherButton.addEventListener("click", function () { requestWeatherSuggestions(false); });
locationWeatherButton.addEventListener("click", function () { requestWeatherSuggestions(true); });

async function requestWeatherSuggestions(useLocation) {
  if (weatherButton.disabled) return;
  weatherButton.disabled = true;
  locationWeatherButton.disabled = true;
  document.getElementById("weatherCity").disabled = true;
  weatherStatus.textContent = useLocation ? "現在地を確認しています。位置情報の利用を許可してください。" : "天気予報を取得しています…";
  document.getElementById("weatherSuggestions").innerHTML = "";
  document.getElementById("weatherSummary").textContent = "";
  try {
    let city;
    if (useLocation) {
      const coordinates = await getWeatherLocation();
      // 天気予報に必要な程度の精度に丸め、保存はしない。
      city = ["現在地付近", coordinates.latitude.toFixed(2), coordinates.longitude.toFixed(2)];
      weatherStatus.textContent = "現在地付近の天気予報を取得しています…";
    } else {
      city = weatherCities[document.getElementById("weatherCity").value];
    }
    if (!city) throw new Error("地域を選択してください。");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city[1]}&longitude=${city[2]}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("天気予報を取得できませんでした。少し待って再度お試しください。");
    const forecast = await response.json();
    const daily = forecast.daily;
    const weather = { date: daily?.time?.[0], maxTemperature: daily?.temperature_2m_max?.[0],
      minTemperature: daily?.temperature_2m_min?.[0], rainProbability: daily?.precipitation_probability_max?.[0] };
    if (!weather.date || ![weather.maxTemperature, weather.minTemperature, weather.rainProbability].every(Number.isFinite)) {
      throw new Error("予報データが不足しています。時間をおいて再度お試しください。");
    }
    const data = { city: city[0], weather, suggestions: suggestWeatherItems(weather) };
    const today = dateKey(new Date());
    if (data.weather.date !== today) throw new Error("予報の日付が今日と一致しません。再度取得してください。");
    document.getElementById("weatherSummary").textContent = `${data.city} / ${data.weather.date}：最高${data.weather.maxTemperature}℃・最低${data.weather.minTemperature}℃・最大降水確率${data.weather.rainProbability}%`;
    data.suggestions.forEach(suggestion => {
      const li = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = suggestion.name;
      const reason = document.createElement("p");
      reason.textContent = suggestion.reason;
      const add = document.createElement("button");
      add.type = "button";
      const exists = () => items.some(item => item.name === suggestion.name);
      add.textContent = exists() ? "追加済み" : "いつもの持ち物に追加";
      add.disabled = exists();
      add.addEventListener("click", function () {
        if (dateKey(new Date()) !== today) { weatherStatus.textContent = "日付が変わりました。提案を再取得してください。"; return; }
        if (!exists()) {
          const updated = [...items, { name: suggestion.name, checked: false }];
          try { localStorage.setItem("items", JSON.stringify(updated)); }
          catch { weatherStatus.textContent = "持ち物を保存できませんでした。"; return; }
          items = updated;
          displayItems();
        }
        add.disabled = true;
        add.textContent = "追加済み";
        weatherStatus.textContent = `「${suggestion.name}」をいつもの持ち物に追加しました。`;
      });
      li.appendChild(title); li.appendChild(reason); li.appendChild(add);
      document.getElementById("weatherSuggestions").appendChild(li);
    });
    weatherStatus.textContent = data.suggestions.length ? "必要な持ち物を選んで追加してください。" : "今回の提案はありません。";
  } catch (error) {
    weatherStatus.textContent = error.name === "TimeoutError" ? "取得に時間がかかっています。少し待ってから再度お試しください。" : error instanceof TypeError ? "天気を取得できませんでした。インターネット接続を確認して再度お試しください。" : error.message;
  } finally {
    weatherButton.disabled = false;
    locationWeatherButton.disabled = false;
    document.getElementById("weatherCity").disabled = false;
  }
}

function getWeatherLocation() {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext || !navigator.geolocation) {
      reject(new Error("この環境では現在地を取得できません。HTTPSまたはlocalhostで開くか、地域を選んで提案を取得してください。"));
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        reject(new Error("位置情報を確認できませんでした。地域を選んで提案を取得してください。"));
        return;
      }
      resolve({ latitude, longitude });
    }, error => {
      const messages = {
        1: "位置情報が許可されていません。ブラウザや端末の設定を確認するか、地域を選んで提案を取得してください。",
        2: "現在地を取得できませんでした。地域を選んで提案を取得してください。",
        3: "位置情報の取得がタイムアウトしました。再度試すか、地域を選んで提案を取得してください。"
      };
      reject(new Error(messages[error.code] || messages[2]));
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  });
}


const weatherCities = {
  sapporo: ["札幌", 43.062, 141.354], sendai: ["仙台", 38.268, 140.869],
  tokyo: ["東京", 35.681, 139.767], nagoya: ["名古屋", 35.181, 136.907],
  osaka: ["大阪", 34.694, 135.502], hiroshima: ["広島", 34.385, 132.455],
  fukuoka: ["福岡", 33.59, 130.402], naha: ["那覇", 26.212, 127.681]
};

// 本アプリで定めた提案条件。医療上の基準や気象警報ではない。
function suggestWeatherItems(weather) {
  const suggestions = [];
  if (weather.rainProbability >= 40) suggestions.push({ name: "折りたたみ傘", reason: `最大降水確率が${weather.rainProbability}%の予報です。雨に備えて持っていきましょう。` });
  if (weather.maxTemperature >= 25) suggestions.push({ name: "飲み物", reason: `最高気温が${weather.maxTemperature}℃の予報です。暑い日の外出に備えましょう。` });
  if (weather.minTemperature <= 15) suggestions.push({ name: "上着", reason: `最低気温が${weather.minTemperature}℃の予報です。朝晩の寒さに備えましょう。` });
  return suggestions;
}
