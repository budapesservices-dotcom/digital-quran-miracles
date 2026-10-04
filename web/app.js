async function loadAnalytics() {
  const status = document.getElementById("status");
  const app = document.getElementById("app");

  try {
    const response = await fetch("./data/analytics.json");

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data = await response.json();

    status.textContent =
      `${data.terms.length} analytical terms loaded.`;

    app.innerHTML = `
      <h2>Frequency Findings</h2>
      <ul>
        ${data.terms.map(
          term => `
            <li>
              <strong>${term.word}</strong>
              — ${term.count}
            </li>
          `
        ).join("")}
      </ul>
    `;

  } catch (error) {
    status.textContent =
      "Unable to load analytical data.";

    console.error(error);
  }
}

loadAnalytics();
