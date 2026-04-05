const form = document.getElementById("plantForm");
const messageDiv = document.getElementById("message");
const plantsList = document.getElementById("plantsList");

document.addEventListener("DOMContentLoaded", loadPlants);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  if (!/^\d{8}$/.test(data.edrpou)) {
    showMessage("error", "ЄДРПОУ повинен містити рівно 8 цифр");
    return;
  }

  try {
    const response = await fetch("/api/plants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showMessage("success", result.message);
      form.reset();
      loadPlants();
    } else {
      showMessage("error", result.message);
    }
  } catch (error) {
    console.error(error);
    showMessage("error", "Помилка з'єднання з сервером");
  }
});

async function loadPlants() {
  try {
    const response = await fetch("/api/plants");
    const plants = await response.json();
    displayPlants(plants);
  } catch (error) {
    console.error("Помилка завантаження:", error);
    plantsList.innerHTML = `<p class="empty-text">Не вдалося завантажити записи</p>`;
  }
}

function displayPlants(plants) {
  if (!plants.length) {
    plantsList.innerHTML = `<p class="empty-text">Немає зареєстрованих установок</p>`;
    return;
  }

  plantsList.innerHTML = plants
    .map(
      (plant) => `
        <div class="plant-card">
          <h3>${plant.enterprise}</h3>
          <p><span class="label">ЄДРПОУ:</span> ${plant.edrpou}</p>
          <p><span class="label">Тип:</span> ${getPlantTypeName(plant.plantType)}</p>
          <p><span class="label">Потужність:</span> ${plant.power} МВт</p>
          <p><span class="label">Ліцензія:</span> ${plant.license}</p>
          <p><span class="label">Локація:</span> ${plant.location || "—"}</p>
          <p><span class="label">Примітки:</span> ${plant.notes || "—"}</p>
          <p><span class="label">Дата запису:</span> ${new Date(plant.createdAt).toLocaleString("uk-UA")}</p>
          <button class="btn btn-delete" onclick="deletePlant('${plant.id}')">Видалити</button>
        </div>
      `
    )
    .join("");
}

async function deletePlant(id) {
  const confirmed = confirm("Ви впевнені, що хочете видалити цей запис?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/plants/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (result.success) {
      showMessage("success", result.message);
      loadPlants();
    } else {
      showMessage("error", result.message);
    }
  } catch (error) {
    console.error(error);
    showMessage("error", "Помилка з'єднання з сервером");
  }
}

function showMessage(type, text) {
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messageDiv.style.display = "block";

  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 4000);
}

function getPlantTypeName(type) {
  const types = {
    solar: "Сонячна електростанція",
    wind: "Вітрова електростанція",
    hydro: "Гідроелектростанція",
    thermal: "Теплова електростанція",
    biogas: "Біогазова установка"
  };

  return types[type] || type;
}
