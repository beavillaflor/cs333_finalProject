<script>
  import { onMount } from "svelte";
  import { csv } from "d3-fetch";
  import { scaleLinear, scaleBand } from "d3-scale";
  import { line } from "d3-shape";
  import { extent } from "d3-array";
  import { fade } from "svelte/transition";
  import PlaneSeating from "./PlaneSeating.svelte";

  let { scrollIndex = $bindable() } = $props();

  let enrollmentData = $state();
  let countryData = $state();
  let fieldData = $state();

  onMount(async () => {
    enrollmentData = await csv(
      "https://raw.githubusercontent.com/nguyencomputing/cs333_finalProject/refs/heads/main/enrollmentData.csv"
    );
    countryData = await csv('https://raw.githubusercontent.com/beavillaflor/cs333_finalProject/refs/heads/main/countryData.csv');
    fieldData = await csv('https://raw.githubusercontent.com/amiemasih/cs333_finalProject/refs/heads/main/fieldsOfStudy.csv');
  });

  let spacing = 40;
  let column = 10;
  let rows = 10;

  // bump right margin so the plane doesn't clip
  let margin = { top: 20, left: 70, bottom: 40, right: 50 };
  let width = column * spacing + margin.left + margin.right + 100; //increased width for plane seating and legend
  let height = rows * spacing + 100; // increased height too

  let padding = 20;

  let enrollmentDataset = $derived.by(() => {
    if (!enrollmentData) return [];
    return enrollmentData.map((d) => ({
      year: +d.year,
      students: parseFloat(String(d.students).replace(/,/g, "")),
    }));
  });

  let countryDataset = $derived.by(() => {
    if (!countryData) return [];
    return countryData.map((d) => ({
        country: d["Place of Origin"],
        count22: +d["2022/23"].replace(/,/g,""),
        count23: +d["2023/24"].replace(/,/g,""),
        percent: +d["% of Total"],
        change: +d["% Change"]
            }))
        });

  let fieldDataset = $derived.by(() => {
    if (!fieldData) return [];
    return fieldData.map((d) => ({
      country: d["Place of Origin"],
      business: parseFloat(d["Business and Management"]) || 0,
      education: parseFloat(d["Education"]) || 0,
      engineering: parseFloat(d["Engineering"]) || 0,
      fineArts: parseFloat(d["Fine and Applied Arts"]) || 0,
      health: parseFloat(d["Health Professions"]) || 0,
      humanities: parseFloat(d["Humanities"]) || 0,
      intensiveEnglish: parseFloat(d["Intensive English"]) || 0,
      mathCS: parseFloat(d["Math and Computer Science"]) || 0,
      physicalLife: parseFloat(d["Physical and Life Sciences"]) || 0,
      socialSciences: parseFloat(d["Social Sciences"]) || 0,
      otherFields: parseFloat(d["Other Fields of Study"]) || 0,
      undeclared: parseFloat(d["Undeclared"]) || 0
    }));
  });

  const innerW = $derived(width - margin.left - margin.right);
  const innerH = $derived(height - margin.top - margin.bottom);

  const xScale = $derived.by(() => {
    if (!enrollmentDataset.length) return null;
    return scaleLinear().domain(extent(enrollmentData, (d) => d.year)).range([0, innerW]);
  });

  const yScale = $derived.by(() => {
    if (!enrollmentDataset.length) return null;
    return scaleLinear().domain([0, Math.max(...enrollmentDataset.map((d) => d.students))]).nice().range([innerH, 0]);
  });

  function formatTick(value) {
    if (value === 0) return "0";
    if (value >= 1_000_000) {
      const num = value / 1_000_000;
      return num % 1 === 0 ? num + "m" : num.toFixed(1) + "m";
    }
    if (value >= 1_000) {
      const num = value / 1_000;
      return num % 1 === 0 ? num + "k" : num.toFixed(1) + "k";
    }
    return value;
  }

  const xScaleBea = $derived.by(() => {
    if (!countryDataset.length) return null;
    return scaleBand().domain(countryDataset.map(d => d.country)).range([0, innerW]).padding(0.1);
  });

  const maxCount = $derived(() =>
    countryDataset.length ? Math.max(...countryDataset.map(d => d.count23)) : 0
  );

  const yScaleBea = $derived.by(() => {
    if (!countryDataset.length) return null;
    const max = Math.max(...countryDataset.map(d => d.count23));
    const upper = max > 0 ? max : 1; 
    return scaleLinear().domain([0, upper]).nice().range([innerH, 0]);
  });

  const yTicksBea = $derived.by(() => {
    if (!yScaleBea) return [];
    const top = yScaleBea.domain()[1];
    const auto = yScaleBea.ticks(6);
    const set = new Set([0, ...auto, top]);
    return Array.from(set).sort((a, b) => a - b);
  });

  const lineGen = $derived.by(() => {
    if (!xScale || !yScale) return null;
    return line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.students));
  });

  const ticks = $derived.by(() => {
    if (!enrollmentDataset.length) return [];
    const startYear = enrollmentDataset[0].year;
    const endYear = enrollmentDataset[enrollmentDataset.length - 1].year;
    const step = 15;
    let t = [startYear];
    for (let y = startYear + step; y < endYear; y += step) t.push(y);
    t.push(endYear);
    return t;
  });

  const plane = $derived.by(() => {
    if (!xScale || !yScale || enrollmentDataset.length < 2) return null;
    const p1 = enrollmentDataset[enrollmentDataset.length - 2];
    const p2 = enrollmentDataset[enrollmentDataset.length - 1];
    const x1 = xScale(p1.year), y1 = yScale(p1.students);
    const x2 = xScale(p2.year), y2 = yScale(p2.students);

    return { x: x2, y: y2 };
  });

  // plane seating scales
  const planeXScale = $derived.by(() => {
    if (!innerW) return null;
    return scaleLinear()
      .domain([0, 100])  // 0-100 seats
      .range([0, innerW]);   
  });

  const planeYScale = $derived.by(() => {
    if (!innerH) return null;
    return scaleLinear()
      .domain([0, 10])  // data range 0-10 rows
      .range([0, innerH]); 
  });
</script>

<svg width={width} height={height}>
  <g transform="translate({margin.left}, {margin.top})">
    {#if scrollIndex == 0 && enrollmentDataset.length}
      <g transition:fade>
      <!-- LINE CHART SECTION -->
        <!-- X axis line -->
        <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#ccc" stroke-width="2" />

        <!-- X axis ticks -->
        {#each ticks as y}
          <line x1={xScale(y)} x2={xScale(y)} y1={innerH - 5} y2={innerH + 5} stroke="#888" stroke-width="2" />
          <text x={xScale(y)} y={innerH + 20} text-anchor="middle" font-size="13" fill="#555" font-weight="bold">{y}</text>
        {/each}

        <!-- Axis Label -->
        <text x={innerW / 2} y={innerH + 40} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">Year</text>

        <!-- Y axis line -->
        <line x1={0} x2={0} y1={0} y2={innerH} stroke="#ccc" stroke-width="2" />

        <!-- Y axis ticks -->
        {#if yScale}
          {#each yScale.ticks(5) as s}
            <line x1={-5} x2={5} y1={yScale(s)} y2={yScale(s)} stroke="#888" stroke-width="2" />
            <text x={-10} y={yScale(s) + 4} text-anchor="end" font-size="13" font-weight="bold" fill="#555">
              {formatTick(s)}
            </text>
          {/each}
        {/if}

        <!-- Y axis label -->
        <text transform="rotate(-90)" x={-innerH / 2} y={-45} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">
          Students
        </text>

        <!-- Line plot -->
        {#if lineGen}
          <path d={lineGen(enrollmentDataset)} fill="none" stroke="#4477AA" stroke-width="2" />
        {/if}

        {#if plane}
          <text
            x={plane.x} y={plane.y} transform="rotate(-40, {plane.x}, {plane.y})" text-anchor="middle" dominant-baseline="middle" font-size="22" style="pointer-events:none"
          >
          <!-- the pointer event thing is a trick that stops the cursor from changing to a text cursor when hovering over the emoji lolz -->
            ✈️
          </text>
        {/if}
      </g>
    {/if}
  </g>

  <!-- BAR CHART SECTION -->
  <g transform="translate({margin.left}, {margin.top})">
    {#if scrollIndex == 1 && countryDataset.length}
    <g transition:fade>
      <!-- X axis  -->
      <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#ccc" stroke-width="2" />
      <!-- <text x={innerW / 2} y={innerH + 40} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">Countries</text> -->
      {#each countryDataset as d}
        <text
          x={xScaleBea(d.country) + xScaleBea.bandwidth() / 2}
          y={innerH + 20}
          text-anchor="middle"
          font-size="8px"
          font-weight="bold"
          fill="#555"
          transform="rotate(-35, {xScaleBea(d.country) + xScaleBea.bandwidth() / 2}, {innerH + 15})">{d.country}</text>
      {/each}
      <!-- Y axis  -->
       <line x1={0} x2={0} y1={0} y2={innerH} stroke="#ccc" stroke-width="2" />
        <text transform="rotate(-90)" x={-innerH / 2} y={-45} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">
          Students
        </text>
        {#if yScaleBea}
          {#each yTicksBea as s}
            <line x1={-5} x2={5} y1={yScaleBea(s)} y2={yScaleBea(s)} stroke="#888" stroke-width="2" />
            <text x={-10} y={yScaleBea(s) + 4} text-anchor="end" font-size="13" font-weight="bold" fill="#555">
              {s >= 1000 ? Math.round(s / 1000) + 'k' : s}
            </text>
          {/each}

          {#each countryDataset as d}
            <g class="country {d.country}">
              <rect
                x={xScaleBea(d.country)}
                y={yScaleBea(d.count23)}
                width={xScaleBea.bandwidth()}
                height={Math.max(0, innerH - yScaleBea(d.count23))}
                fill="#4477AA"
              />
            </g>
          {/each}
        {/if}
    </g>
    {/if}
     </g>

       <!-- PLANE SEATING SECTION -->
    <g transform="translate({margin.left}, {margin.top})">
      {#if scrollIndex == 2 && fieldDataset.length}
      <g transition:fade>
        <foreignObject x="0" y="0" width={innerW} height={innerH}>
          <PlaneSeating country="China" fieldData={fieldData} />
        </foreignObject>
      </g>
      {/if}
      {#if scrollIndex == 3 && fieldDataset.length}
      <g transition:fade>
        <foreignObject x="0" y="0" width={innerW} height={innerH}>
          <PlaneSeating country="United Kingdom" fieldData={fieldData} />
        </foreignObject>
      </g>
      {/if}
    </g>
 </svg>

