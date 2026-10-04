function renderD3Distribution(term) {
  const container = document.getElementById(
    "d3-distribution-chart"
  );

  if (!container || !window.d3 || !term) {
    return;
  }

  const d3 = window.d3;

  const raw = Object.entries(
    term.distribution.surahs
  );

  const data = raw.map(
    ([surah, count]) => ({
      surah: Number(surah),
      count: Number(count),
    })
  );

  const width = Math.max(
    container.clientWidth || 700,
    320
  );

  const height = 300;

  const margin = {
    top: 18,
    right: 22,
    bottom: 42,
    left: 46,
  };

  const innerWidth =
    width - margin.left - margin.right;

  const innerHeight =
    height - margin.top - margin.bottom;

  container.replaceChildren();

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      `D3 distribution of ${term.word} across 114 surahs`
    );

  const chart = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},${margin.top})`
    );

  const maxCount = d3.max(
    data,
    (d) => d.count
  ) || 1;

  const x = d3
    .scaleLinear()
    .domain([1, 114])
    .range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, maxCount])
    .nice()
    .range([innerHeight, 0]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(8)
    .tickFormat(d3.format("d"));

  const yAxis = d3
    .axisLeft(y)
    .ticks(5)
    .tickFormat(d3.format("d"));

  chart
    .append("g")
    .attr("class", "d3-grid")
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat("")
    );

  chart
    .append("g")
    .attr("class", "d3-axis")
    .attr(
      "transform",
      `translate(0,${innerHeight})`
    )
    .call(xAxis);

  chart
    .append("g")
    .attr("class", "d3-axis")
    .call(yAxis);

  const line = d3
    .line()
    .x((d) => x(d.surah))
    .y((d) => y(d.count))
    .curve(d3.curveMonotoneX);

  chart
    .append("path")
    .datum(data)
    .attr("class", "d3-series")
    .attr("d", line);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "d3-tooltip");

  const selectedSurah =
    document.querySelector(
      ".bar-button.selected"
    )?.dataset.surah;

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
        String(d.surah) === selectedSurah
      ) {
        classes.push("selected");
      }

      return classes.join(" ");
    })
    .attr("cx", (d) => x(d.surah))
    .attr("cy", (d) => y(d.count))
    .attr(
      "r",
      (d) => d.count === 0 ? 2.2 : 4
    )
    .on("mouseenter", function (event, d) {
      d3.select(this).attr(
        "r",
        d.count === 0 ? 3.5 : 6
      );

      tooltip
        .style("opacity", 1)
        .html(
          `<strong>Surah ${d.surah}</strong><br>` +
          `${d.count} occurrence${
            d.count === 1 ? "" : "s"
          }`
        );
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.clientX}px`)
        .style("top", `${event.clientY}px`);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).attr(
        "r",
        d.count === 0 ? 2.2 : 4
      );

      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      if (d.count === 0) {
        return;
      }

      const button = document.querySelector(
        `.bar-button[data-surah="${d.surah}"]`
      );

      if (button) {
        button.click();

        document
          .getElementById("evidence")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }
    });

  const resizeObserver =
    new ResizeObserver(() => {
      renderD3Distribution(term);
    });

  resizeObserver.observe(container);

  container._d3ResizeObserver =
    resizeObserver;

  setTimeout(() => {
    tooltip.remove();
  }, 0);
}
