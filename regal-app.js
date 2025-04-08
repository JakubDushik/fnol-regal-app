const fileInput = document.getElementById("fileInput");
const scanBtn = document.getElementById("scanBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const regalyList = document.getElementById("regalyList");
const zebrikyList = document.getElementById("zebrikyList");

let regaly = JSON.parse(localStorage.getItem("regaly")) || [];
let zebriky = JSON.parse(localStorage.getItem("zebriky")) || [];

function renderLists() {
  regalyList.innerHTML = "";
  zebrikyList.innerHTML = "";

  regaly.forEach((item, index) => {
    regalyList.appendChild(createItemElement(item, index, "regal"));
  });

  zebriky.forEach((item, index) => {
    zebrikyList.appendChild(createItemElement(item, index, "zebrik"));
  });
}

function createItemElement(text, index, type) {
  const li = document.createElement("li");
  li.textContent = text;

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = () => {
    const newText = prompt("Upravit položku:", text);
    if (newText) {
      if (type === "regal") {
        regaly[index] = newText;
        localStorage.setItem("regaly", JSON.stringify(regaly));
      } else {
        zebriky[index] = newText;
        localStorage.setItem("zebriky", JSON.stringify(zebriky));
      }
      renderLists();
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.onclick = () => {
    if (type === "regal") {
      regaly.splice(index, 1);
      localStorage.setItem("regaly", JSON.stringify(regaly));
    } else {
      zebriky.splice(index, 1);
      localStorage.setItem("zebriky", JSON.stringify(zebriky));
    }
    renderLists();
  };

  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  return li;
}

scanBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Nahraj fotku šablony.");

  const img = new Image();
  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
      logger: m => console.log(m)
    });

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let regCount = regaly.length + 1;
    let zebrikCount = zebriky.length + 1;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("regál") || lower.includes("regal") || lower.includes("rg")) {
        regaly.push(`RG - ${regCount++}`);
      } else if (lower.includes("žebřík") || lower.includes("zebrik") || lower.includes("žb") || lower.includes("zb")) {
        zebriky.push(`ŽB - ${zebrikCount++}`);
      }
    }

    localStorage.setItem("regaly", JSON.stringify(regaly));
    localStorage.setItem("zebriky", JSON.stringify(zebriky));
    renderLists();
  };

  img.src = URL.createObjectURL(file);
});

// Načtení uložených dat
renderLists();
