<script>
  import { onMount } from 'svelte';
  import { tooltip } from './tooltip.js';

  let { country = 'China', fieldData = [] } = $props(); //default to China for first slide
  let perCountryData;
  let container; // container for the plane
  
  // reactive seat colors array - make all empty & grey to begin with
  let seatColors = $state(Array(100).fill('#f0f0f0'));
  let seatFields = $state(Array(100).fill('Empty'));

  // extract field names from fieldData - recalculate when fieldData changes
  let fieldNames = $derived.by(() => {
    if (!fieldData || fieldData.length === 0) return [];
    // get the first row 
    const firstRow = fieldData[0];
    //extract all field names except 'Place of Origin' and 'TOTAL STUDENTS'!!
    return Object.keys(firstRow).filter(key => 
      key !== 'Place of Origin' && key !== 'TOTAL STUDENTS'
    );
  });

  // create colour mapping using Tol's Bright 12 (colourblind-friendly)
  const tolBright12 = [
  '#4477AA','#66CCEE','#228833','#CCBB44',
  '#EE6677','#AA3377','#BBBBBB',
  '#9966CC','#33BBEE','#EE7733',
  '#009988','#EE3377'
];

  let colourScheme = $derived.by(() => {
    const scheme = {};
    const palette = tolBright12; // from above
    fieldNames.forEach((field, index) => {
      scheme[field] = palette[index % palette.length]; // cycles if >12
    });
    return scheme;
  });

  onMount(() => {
    updateCountryData();
  });

  // reactive effect to update data when country or fieldData changes
  $effect(() => {
      updateCountryData();
    }
  );

  //process the data for the selected country and update the seat colors and fields
    function updateCountryData() {
    if (!fieldData || !Array.isArray(fieldData) || fieldData.length === 0) {
      return;
    }
    
    perCountryData = fieldData.find(d => d['Place of Origin'] === country);
    
    if (perCountryData) {
      // calculate seat allocation and round to nearest integer
      const seatAllocation = {};
      let totalAllocated = 0;
      
      //calculate initial seat allocation
      const fieldMapping = {};
      fieldNames.forEach(field => {
        fieldMapping[field] = parseFloat(perCountryData[field]) || 0;
      });
      //round to nearest integer
      for (const field of fieldNames) {
        const percentage = fieldMapping[field] || 0;
        const seats = Math.round(percentage);
        seatAllocation[field] = seats;
        totalAllocated += seats;
      }
      
      // adjust for exactly 100 seats
      if (totalAllocated !== 100) {
        // finding the field with the largest decimal remainder and adjust
        const remainders = fieldNames.map(field => {
          const percentage = fieldMapping[field] || 0;
          return { field, remainder: percentage - Math.floor(percentage) };
        }).sort((a, b) => b.remainder - a.remainder);
        
        if (totalAllocated < 100) {
          // need to add seats
          let seatsToAdd = 100 - totalAllocated;
          for (let i = 0; i < seatsToAdd && i < remainders.length; i++) {
            seatAllocation[remainders[i].field]++;
          }
        } else {
          // need to remove seats
          let seatsToRemove = totalAllocated - 100;
          for (let i = 0; i < seatsToRemove && i < remainders.length; i++) {
            seatAllocation[remainders[i].field]--;
          }
        }
      }
      
      // update reactive seat arrays
      let seatIndex = 0;
      for (const field of fieldNames) {
        const seatsForField = seatAllocation[field];
        for (let i = 0; i < seatsForField && seatIndex < 100; i++) {
          seatColors[seatIndex] = colourScheme[field];
          seatFields[seatIndex] = field;
          seatIndex++;
        }
      }
      
      // reactive update by reassigning the arrays
      seatColors = [...seatColors];
      seatFields = [...seatFields];
    }
  }


</script>

<svelte:head>
  <style>
    .plane-container {
      font-family: monospace;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 5px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      box-sizing: border-box;
    }

    .flight-title {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
      padding: 5px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

            .legend {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
          margin-top: 5px;
          padding: 5px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #ddd;
        }
      
         .legend-item {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 500;
        }
      
      .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      border: 1px solid #333;
    }

    .plane-layout {
      display: grid;
      grid-template-columns: 0.8fr 1.4fr 0.8fr;
      gap: 30px;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #ddd;
      box-sizing: border-box;
    }
    
    .left-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      align-items: center;
    }
    
    .middle-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      align-items: center;
    }
    
    .right-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      align-items: center;
    }

    .seat {
      width: 100%;
      height: 100%;
      min-width: 16px;
      min-height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 2px;
      position: relative;
      border: 1px solid #333;
      padding: 1px;
    }

    .seat:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .seat-icon {
      width: 70%;
      height: 70%;
      max-width: 16px;
      max-height: 16px;
      color: #333;
    }

    .svelte-tooltip {
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

  .svelte-tooltip::after {
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
</svelte:head>

  <div class="plane-container" bind:this={container}>
    <!-- wrapper to scale down the entire thing and make it fit -->
    <div class="scale-wrapper">
      <!-- flight title -->
            <div class="flight-title">
          Seating for Flight {country === 'United Kingdom' ? '212' : '333'} from {country}
        </div>
    
    <div class="plane-layout">
    <!-- left section - 30 seats - 3 columns × 10 rows) -->
    <div class="left-section">
      {#each Array(30) as _, seatIndex}
      <div 
        class="seat" 
        style="background-color: {seatColors[seatIndex]}"
        use:tooltip={`Seat ${seatIndex + 1}: ${seatFields[seatIndex]}`}
      >
        <!-- human icon from noun project -->
        <img src="https://raw.githubusercontent.com/amiemasih/cs333_finalProject/refs/heads/main/noun-person.svg" class="seat-icon" alt="person" />
      </div>
      {/each}
    </div>

    <!-- middle section - 40 seats - 4 columns × 10 rows) -->
    <div class="middle-section">
      {#each Array(40) as _, seatIndex}
        <div 
          class="seat" 
          style="background-color: {seatColors[seatIndex + 30]}"
          use:tooltip={`Seat ${seatIndex + 31}: ${seatFields[seatIndex + 30]}`}
        >
          <img src="https://raw.githubusercontent.com/amiemasih/cs333_finalProject/refs/heads/main/noun-person.svg" class="seat-icon" alt="person" />
        </div>
      {/each}
    </div>

    <!-- right section - 30 seats - 3 columns × 10 rows) -->
    <div class="right-section">
      {#each Array(30) as _, seatIndex}
        <div 
          class="seat" 
          style="background-color: {seatColors[seatIndex + 70]}"
          use:tooltip={`Seat ${seatIndex + 71}: ${seatFields[seatIndex + 70]}`}
        >
          <img src="https://raw.githubusercontent.com/amiemasih/cs333_finalProject/refs/heads/main/noun-person.svg" class="seat-icon" alt="person" />
        </div>
      {/each}
    </div>
  </div>
  
  <!-- colour legend at the bottom -->
  <div class="legend">
    {#each fieldNames as field}
      <div class="legend-item">
        <div class="legend-color" style="background-color: {colourScheme[field]}"></div>
        <span>{field}</span>
      </div>
    {/each}
  </div>
    </div>
  </div>
