function renderD3Distribution(term) {
  const container = document.getElementById("d3-distribution-chart");

  if (!container || !window.d3 || !term) {
    return;
  }

  if (container._d3ResizeObserver) {
    container._d3ResizeObserver.disconnect();
    container._d3ResizeObserver = null;
  }

  if (container._d3ResizeFrame) {
    cancelAnimationFrame(container._d3ResizeFrame);

    container._d3ResizeFrame = null;
  }

  document.querySelectorAll(".d3-tooltip").forEach((element) => {
    element.remove();
  });

  const d3 = window.d3;

  const data = Object.entries(term.distribution?.surahs || {}).map(
    ([surah, count]) => ({
      surah: Number(surah),
      count: Number(count),
    }),
  );

  const activeSurahs = data.filter((item) => item.count > 0).length;

  const totalOccurrences = data.reduce((sum, item) => sum + item.count, 0);

  const insightText =
    state.language === "id"
      ? {
          active: `${formatNumber(activeSurahs)} surah dengan kecocokan`,

          occurrences: `${formatNumber(totalOccurrences)} occurrence`,

          hint: "Ukuran titik mengikuti frekuensi. Klik titik untuk menelusuri evidence.",
        }
      : state.language === "ar"
        ? {
            active: `${formatNumber(activeSurahs)} سورة تحتوي على تطابق`,

            occurrences: `${formatNumber(totalOccurrences)} ظهور`,

            hint: "حجم النقطة يعكس التكرار. انقر على النقطة لفحص الدليل.",
          }
        : {
            active: `${formatNumber(activeSurahs)} surahs with matches`,

            occurrences: `${formatNumber(totalOccurrences)} occurrences`,

            hint: "Point size follows frequency. Click a point to inspect evidence.",
          };

  const maxCount = d3.max(data, (d) => d.count) || 0;

  if (!data.length || maxCount === 0) {
    container.innerHTML = `
      <div class="d3-empty-state">

        <strong>
          No exact matches found
        </strong>

        <span>
          This term has 0 occurrences
          using the current exact
          normalized-token method.
        </span>

        <small>
          No root or morphological
          matching is applied.
        </small>

      </div>
    `;

    return;
  }

  const width = Math.max(container.clientWidth || 700, 320);
  const height = 280;
  const margin = {
    top: 22,
    right: 24,
    bottom: 42,
    left: 28,
  };

  const innerWidth = width - margin.left - margin.right;

  const innerHeight = height - margin.top - margin.bottom;

  container.replaceChildren();

  const insight = document.createElement("div");

  insight.className = "d3-insight";

  insight.innerHTML = `
    <strong>
      ${escapeHtml(insightText.active)}
    </strong>

    <span>
      ${escapeHtml(insightText.occurrences)}
    </span>

    <small>
      ${escapeHtml(insightText.hint)}
    </small>
  `;

  container.appendChild(insight);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", `Surah distribution of ${term.word}`);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([1, 114]).range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, maxCount])
    .nice()
    .range([innerHeight, 0]);

  const radius = d3.scaleSqrt().domain([0, maxCount]).range([2.5, 9]);

  const names = new Map(
    (term.evidence?.occurrences || []).map((item) => [
      String(item.surah),
      item.surah_name || "",
    ]),
  );

  chart
    .append("line")
    .attr("class", "d3-baseline")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", innerHeight)
    .attr("y2", innerHeight);

  chart
    .selectAll(".d3-tick")
    .data(data)
    .join("line")
    .attr("class", "d3-tick")
    .attr("x1", (d) => x(d.surah))
    .attr("x2", (d) => x(d.surah))
    .attr("y1", innerHeight)
    .attr("y2", (d) => (d.count === 0 ? innerHeight - 5 : y(d.count)));

  const selectedSurah = document.querySelector(
    "#surah-filter option:checked",
  )?.value;

  const tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");

  chart
    .selectAll(".d3-point")
    .data(data)
    .join("circle")
    .attr("class", (d) => {
      const classes = ["d3-point"];

      if (d.count === 0) {
        classes.push("d3-zero");
      }

      if (
        selectedSurah &&
        selectedSurah !== "all" &&
        String(d.surah) === selectedSurah
      ) {
        classes.push("selected");
      }

      return classes.join(" ");
    })
    .attr("cx", (d) => x(d.surah))
    .attr("cy", (d) => (d.count === 0 ? innerHeight : y(d.count)))
    .attr("r", (d) => (d.count === 0 ? 2 : radius(d.count)))
    .on("mouseenter", function (event, d) {
      if (d.count === 0) {
        return;
      }

      d3.select(this).attr("r", radius(d.count) + 2);

      const label = names.get(String(d.surah)) || "";

      tooltip.style("opacity", 1).html(`
            <strong>
              ${label ? escapeHtml(label) : `Surah ${d.surah}`}
            </strong>

            <br>

            ${
              state.language === "id"
                ? `${formatNumber(d.count)} occurrence`
                : state.language === "ar"
                  ? `${formatNumber(d.count)} ظهور`
                  : `${formatNumber(d.count)} occurrence${
                      d.count === 1 ? "" : "s"
                    }`
            }
          `);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.clientX}px`)
        .style("top", `${event.clientY}px`);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).attr("r", d.count === 0 ? 2 : radius(d.count));

      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      if (d.count === 0) {
        return;
      }

      const select = document.getElementById("surah-filter");

      if (!select) {
        return;
      }

      select.value = String(d.surah);

      select.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      document.getElementById("evidence")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

  const xAxis = d3
    .axisBottom(x)
    .tickValues([1, 30, 60, 90, 114])
    .tickFormat(d3.format("d"));

  chart
    .append("g")
    .attr("class", "d3-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  const yAxis = d3.axisLeft(y).ticks(4).tickFormat(d3.format("d"));

  chart.append("g").attr("class", "d3-axis d3-axis-y").call(yAxis);

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth || 0;

      if (Math.abs(nextWidth - (container._d3LastWidth || 0)) < 2) {
        return;
      }

      container._d3ResizeFrame = requestAnimationFrame(() => {
        container._d3ResizeFrame = null;

        renderD3Distribution(term);
      });
    });

    container._d3LastWidth = width;

    resizeObserver.observe(container);

    container._d3ResizeObserver = resizeObserver;
  }
}
