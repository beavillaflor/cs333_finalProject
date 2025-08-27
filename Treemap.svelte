<script>
// code references tony dang's, here: https://tonydang.com/d3-svelte-treemap/ 
  import * as d3 from "d3";

  import { tooltip } from "./tooltip.js";

  let { data = $bindable(), width = $bindable(400), height = $bindable(400) } = $props();

  let root = $derived.by(() => {
    if (!data) return null;
    const h = d3.hierarchy(data).sum((d) => d.value || 0);
    return d3.treemap().size([width, height]).padding(1).round(true)(h);
  });
</script>

<svg {width} {height}>
  {#if root}
    {#each root.leaves() as leaf}
      <g transform="translate({leaf.x0},{leaf.y0})">
        <rect
          class="box"
          width={leaf.x1 - leaf.x0}
          height={leaf.y1 - leaf.y0}
          fill={leaf.data.colour}
          fill-opacity="1"
          use:tooltip={`${leaf.data.name}: ${leaf.data.value ?? 0}`}
        />
      </g>
    {/each}
  {/if}
</svg>

<svelte:head>
  <style>
    .box:hover { transform: scale(1.005) }
    .svelte-tooltip {
      position: fixed; background:#333; color:#fff; padding:6px 10px; border-radius:6px;
      font-size:12px; font-family:monospace; white-space:nowrap; z-index:1000;
      pointer-events:none; transform:translate(-50%,-83%); margin-bottom:8px;
      box-shadow:0 2px 8px rgba(0,0,0,.2);
    }
    .svelte-tooltip::after {
      content:''; position:absolute; left:50%; bottom:-5px; transform:translateX(-50%);
      width:0; height:0; border-style:solid; border-width:6px 6px 0 6px; border-color:#333 transparent transparent transparent;
    }
  </style>
</svelte:head>
