<script>
  import { onMount } from "svelte";
  import { csv } from "d3-fetch";
  import { scaleLinear, scaleBand } from "d3-scale";
  import { line } from "d3-shape";
  import { extent } from "d3-array";
  import { fade } from "svelte/transition";
  import PlaneSeating from "./PlaneSeating.svelte";
  import Treemap from "./Treemap.svelte";

  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";
  import { tick } from "svelte";
  import { tooltip } from "./tooltip.js";

  let { scrollIndex = $bindable() } = $props();

  let enrollmentData = $state();
  let countryData = $state();
  let fieldData = $state();

  onMount(async () => {
    enrollmentData = await csv("https://raw.githubusercontent.com/nguyencomputing/cs333_finalProject/refs/heads/main/enrollmentData.csv");
    countryData = await csv('https://raw.githubusercontent.com/beavillaflor/cs333_finalProject/refs/heads/main/countryData.csv');
    fieldData = await csv('https://raw.githubusercontent.com/amiemasih/cs333_finalProject/refs/heads/main/fieldsOfStudy.csv');
  });

  let spacing = 40;
  let column = 10;
  let rows = 10;

  // bump right margin so the plane doesn't clip
  let margin = { top: 20, left: 70, bottom: 90, right: 50 };
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

  // i am aware this is a very inefficient way to load the data, but this was the easiest way to structure it hierarchically
  // works only in this instance as it is defined, limited categorical data
  let treemapData = { "name": "INTERNATIONAL STUDENTS!", 
  "children": 
  [ { "name" : "Agriculture", "children": [ {"name" : "Agriculture", "value": 8560, "colour":"#009988"}, {"name" : "Natural Resources and Conservation", "value": 5747, "colour":"#009988"} ]}, 
  { "name" : "Business and Management", "value": 159810, "colour":"#4477AA" }, 
  { "name" : "Communications and Journalism", "children": [ {"name" : "Communication, Journalism", "value": 18165, "colour":"#009988"}, {"name" : "Communications Technologies/Technicians", "value": 3316, "colour":"#009988"} ]},
  { "name" : "Education", "value": 15590, "colour":"#66CCEE" }, 
  { "name" : "Engineering", "children": [ {"name" : "Construction Trades", "value": 294, "colour":"#228833"}, {"name" : "Engineering", "value": 188574, "colour":"#228833"}, 
    {"name" : "Engineering Technologies/Technicians", "value": 17465, "colour":"#228833"	}, {"name" : "Mechanic and Repair Technologies/Technicians", "value": 276, "colour":"#228833"	},
    {"name" : "Military Technologies", "value": 674, "colour":"#228833"	}, {"name" : "Precision Production", "value": 66, "colour":"#228833" }, {"name" : "Transportation and Materials Moving", "value": 2814, "colour":"#228833"	}
  ]},
  { "name" : "Fine and Applied Arts", "children": [ {"name" : "Architecture", "value": 13425, "colour":"#CCBB44"}, {"name" : "Visual and Performing Arts", "value": 40734, "colour":"#CCBB44"} ]},
  { "name" : "Health Professions", "children": [ {"name" : "Health Professions", "value": 35864, "colour":"#EE6677"}, {"name" : "Residency Programs", "value": 751, "colour":"#EE6677"} ]},
  { "name" : "Humanities", "children": [ {"name" : "English Language and Literature/Letters", "value": 4288, "colour":"#AA3377"}, {"name" : "Foreign Languages, Literatures, and Linguistics", "value": 6250, "colour":"#AA3377"}, 
    {"name" : "Philosophy and Religious Studies", "value": 2946, "colour":"#AA3377"	}, {"name" : "Theology and Religious Vocations", "value": 2453, "colour":"#AA3377" }
  ]},
  { "name" : "Intensive English", "value": 9750, "colour":"#BBBBBB" },
  { "name" : "Legal Studies and Law Enforcement", "children": [ {"name" : "Homeland Security, Law Enforcement, and Firefighting", "value": 2118, "colour":"#009988"}, {"name" : "Legal Professions and Studies", "value": 13386, "colour":"#009988"} ]},
  { "name" : "Math and Computer Science", "children": [ {"name" : "Computer and Information Sciences", "value": 236922, "colour":"#9966CC"}, {"name" : "Mathematics and Statistics", "value": 44000, "colour":"#9966CC"} ]},
  { "name" : "Physical and Life Sciences", "children": [ {"name" : "Biological and Biomedical Sciences", "value": 53139, "colour":"#33BBEE"}, {"name" : "Physical Sciences", "value": 35060, "colour":"#33BBEE"},
    {"name" : "Science Technologies/Technicians", "value": 518, "colour":"#33BBEE"}
   ]},
  { "name" : "Social Sciences", "children": [ {"name" : "Area, Ethnic, Cultural, and Gender Studies", "value": 2389, "colour":"#EE7733"}, {"name" : "History", "value": 2584, "colour":"#EE7733"}, 
    {"name" : "Psychology", "value": 18468, "colour":"#EE7733"	}, {"name" : "Public Administration and Social Service Professions", "value": 7859, "colour":"#EE7733"	},
    {"name" : "Social Sciences", "value": 53007, "colour":"#EE7733"	}
  ]},
  { "name" : "Other Fields of Study", "children": [ {"name" : "Basic Skills", "value": 2298, "colour": "#009988"}, {"name" : "Family and Consumer Sciences/Human Sciences", "value": 1979, "colour": "#009988"}, 
    {"name" : "Liberal Arts and Sciences/General Studies", "value": 41810, "colour": "#009988"	}, {"name" : "Library Science", "value": 562, "colour": "#009988"	},
    {"name" : "Multi/Interdisciplinary Studies", "value": 47526, "colour": "#009988"	}, {"name" : "Parks, Recreation, Leisure, and Fitness Studies", "value": 6372, "colour": "#009988"	}, {"name" : "Personal and Culinary Services", "value": 1834, "colour": "#009988" },
    {"name" : "Reserve Officer Training Corps", "value": 59, "colour": "#009988"	},
  ]},
  { "name" : "Undeclared", "value": 16988, "colour": "#EE3377" }, 
  ]};

  const innerW = $derived(width - margin.left - margin.right);
  const innerH = $derived(height - margin.top - margin.bottom);

  const xScale = $derived.by(() => {
    if (!enrollmentDataset.length) return null;
    return scaleLinear().domain(extent(enrollmentDataset, (d) => d.year)).range([0, innerW]);
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

  // ANIMATION!!!
  const lineProgressStore = tweened(0, { duration: 5000, easing: cubicInOut });
  let progress = $state(0);

  onMount(() => {
    const unsub = lineProgressStore.subscribe(v => (progress = v));
    return () => unsub();
  });

  let linePath = $state();
  let totalLength = $state(0);
  let planePos = $state(null);
  let planeAngle = $state(-40);
  let lastAngle = $state(null);

  $effect(async () => {
    if (scrollIndex === 0 && lineGen && enrollmentDataset.length) {
      // Snap back to 0
      lineProgressStore.set(0, { duration: 0 });

      await tick();
      if (!linePath) return;
      totalLength = linePath.getTotalLength();

      // Animate
      lineProgressStore.set(1, { duration: 6500, easing: cubicInOut });
    } else {
      planePos = null;
    }
  });

  // Keeping the plane on the line
  $effect(() => {
    if (!linePath || !totalLength) return;

    const p = progress * totalLength;
    const pt = linePath.getPointAtLength(p);
    planePos = { x: pt.x, y: pt.y };

    const delta = 1;
    const p2 = Math.min(p + delta, totalLength);
    const pt2 = linePath.getPointAtLength(p2);
    const angleRad = Math.atan2(pt2.y - pt.y, pt2.x - pt.x);
    const candidate = (angleRad * 180) / Math.PI;

    // I HAD NO IDEA WHY THE PLANE SUDDENLY JERKS TO A WRONG ANGLE AT THE END SO THIS IS A VERY TACKY SOLUTION TO SOLVE THAT I'M SO SORRY
    if (progress >= 0.999) {
      if (lastAngle != null) planeAngle = lastAngle;
      else planeAngle = candidate; 
    } else {
      planeAngle = candidate;
      lastAngle = candidate;
    }
  });

  // Fractions representing events that occured or ended during years
  const events = [
    {
      label: "1965 Immigration & Nationality Act",
      start: 1965, end: 1966, colour: "#66CCEE",
    },
    {
      label: "1973 Oil Crisis",
      start: 1973, end: 1975, colour: "#228833",
    },
    {
      label: "Post-9/11 Visa Tightening",
      start: 2001.7, end: 2006, colour: "#CCBB44",
    },
    {
      label: "COVID-19 Pandemic",
      start: 2019, end: 2020.3, colour: "#AA3377",
    },
    {
      label: "Post-COVID Rebound",
      start: 2021.2, end: 2023.2, colour: "#9966CC",
    }
  ];

  function bandTip(ev) {
    const range = ev.start === ev.end ? fmtYear(ev.start) : `${fmtYear(ev.start)}–${fmtYear(ev.end)}`;
    return `${ev.label}`.trim();
  }

  // Stupid feature but this tracks the plane's position so we can animate the bands to appear as the plane glide through them 
  let planeX = $state(0);

  $effect(() => {
    planeX = planePos ? planePos.x : 0;
  });

  function revealedWidth(box) {
    if (planeX <= box.x) return 0; 
    return Math.min(planeX - box.x, box.w); 
  }

  const xDomain = $derived(() => (xScale ? xScale.domain() : [0, 1]));

  function xFromYear(y) {
    return xScale ? xScale(y) : 0;
  }

  function fmtYear(y) {
    return Number.isInteger(y) ? String(y) : y.toFixed(1);
  }

  function bandBox(ev, minW = 8) {
    if (!xScale) return { x: 0, w: 0 };
    const x0 = xFromYear(ev.start);
    const x1 = xFromYear(ev.end ?? ev.start);
    const rawX = Math.min(x0, x1);
    const rawW = Math.abs(x1 - x0);
    const w = Math.max(minW, rawW);
    const x = Math.min(Math.max(0, rawX), Math.max(0, innerW - w));
    return { x, w };
  }
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
        <text x={innerW / 2} y={innerH + 40} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">
          Year
        </text>

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

        <!-- Event bands -->
        {#if xScale}
          {#each events as ev (ev.label)}
            {@const box = bandBox(ev)}
            <rect
              x={box.x}
              y={0}
              width={revealedWidth(box)}
              height={innerH}
              fill={ev.colour}
              opacity="0.18"
              style="pointer-events: none"
            />

            <rect
              x={box.x}
              y={0}
              width={revealedWidth(box)}
              height={innerH}
              fill="transparent"
              style="pointer-events: all"
              use:tooltip={bandTip(ev)}
            />
          {/each}
        {/if}

        <!-- Line plot -->
        <path
          bind:this={linePath}
          d={lineGen(enrollmentDataset)}
          fill="none"
          stroke="#4477AA"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-dasharray={totalLength || 1}
          stroke-dashoffset={(1 - progress) * (totalLength || 1)}
          style="pointer-events: none"
        />

        {#if planePos}
          <text
            x={planePos.x}
            y={planePos.y}
            transform={`rotate(${planeAngle + 40} ${planePos.x} ${planePos.y})`}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="22"
            style="pointer-events:none"
          >
            ✈️
          </text>
        {/if}
      </g>
    {/if}
  </g>

  <!-- TREEMAP SECTION -->
  <g transform="translate({margin.left}, {margin.top})">
    {#if scrollIndex == 1 && treemapData}
      <g transition:fade>
        <Treemap data={treemapData} width={innerW} height={innerH} />
      </g>
    {/if}
  </g>

  <!-- BAR CHART SECTION -->
  <g transform="translate({margin.left}, {margin.top})">
    {#if scrollIndex == 2 && countryDataset.length}
    <g transition:fade>
      <!-- X axis  -->
      <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#ccc" stroke-width="2" />

      <!-- X axis labels -->
      <text x={innerW / 2} y={innerH + 50} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">
        Countries
      </text>

      <!-- Country ticks -->
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

      <!-- Y axis label -->
      <text transform="rotate(-90)" x={-innerH / 2} y={-45} text-anchor="middle" font-size="16" fill="#333" font-weight="bold">
        Students
      </text>

      <!-- Y axis ticks -->
        {#if yScaleBea}
          {#each yTicksBea as s}
            <line x1={-5} x2={5} y1={yScaleBea(s)} y2={yScaleBea(s)} stroke="#888" stroke-width="2" />
            <text x={-10} y={yScaleBea(s) + 4} text-anchor="end" font-size="13" font-weight="bold" fill="#555">
              {s >= 1000 ? Math.round(s / 1000) + 'k' : s}
            </text>
          {/each}

          <!-- Bars -->
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
      <!-- Plane seating for China -->
      {#if scrollIndex == 3 && fieldDataset.length}
      <g transition:fade>
        <foreignObject x="0" y="0" width={innerW} height={innerH}>
          <PlaneSeating country="China" fieldData={fieldData} />
        </foreignObject>
      </g>
      {/if}

      <!-- Plane seating for the UK -->
      {#if scrollIndex == 5 && fieldDataset.length}
      <g transition:fade>
        <foreignObject x="0" y="0" width={innerW} height={innerH}>
          <PlaneSeating country="United Kingdom" fieldData={fieldData} />
        </foreignObject>
      </g>
      {/if}
    </g>

        <!-- PLANE SEATING SECTION -->
    <g transform="translate({margin.left}, {margin.top})">
      <!-- Plane seating for China -->
      {#if scrollIndex == 6 && fieldDataset.length}
      <g transition:fade transform=scale(0.75)>
        <foreignObject x="0" y="0" width={innerW} height={innerH}>
          <PlaneSeating country="China" fieldData={fieldData} />
        </foreignObject>
      </g>

      <g transition:fade transform=scale(0.75)>
        <!-- Plane seating for the UK -->
        <foreignObject x="0" y="275" width={innerW} height={innerH}>
          <PlaneSeating country="United Kingdom" fieldData={fieldData} />
        </foreignObject>
      </g>
      {/if}
    </g>
 </svg>


<style>
  :global(.svelte-tooltip) {
    position: fixed;
    background: #333;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-family: monospace;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    transform: translate(-50%, -83%);
    margin-bottom: 8px; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  :global(.svelte-tooltip::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;                
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 6px 0 6px; 
    border-color: #333 transparent transparent transparent;
  }
</style>
