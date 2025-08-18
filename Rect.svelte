<script>
    import { tweened } from 'svelte/motion';
    import { cubicIn } from 'svelte/easing';
    import { interpolate } from 'd3-interpolate';

    const randnum = (min,max) => Math.round( Math.random() * (max-min) + min );

    // Props declaration
    let {d, i, scroll = $bindable()} = $props();
    let size = 20;
    let rx = 5;

    //set up grid
	let spacing = 40;
    let column = 10;
	let rows = 10;

    // Animation parameters
    const tweenParams = {
        duration: 500,
        easing: cubicIn,
        interpolate
    };

    let x = $state(i % column * spacing);
    let y = $state(Math.floor(i / 10) % rows * spacing);
    let width = $state(20)
    let fill = $state("#steelblue");
    let tFill = tweened(fill, {...tweenParams, delay: i * 10});
    let tX = tweened(x, {...tweenParams, delay: i * 10});
    let tY = tweened(y, {...tweenParams, delay: i * 10});
    let tWidth = tweened(width, {...tweenParams, delay: i * 10});
    let tSize = tweened(size, {...tweenParams, delay: i * 10});

    $effect(() => {
        if (scroll == 0) {
            // Step 1

        } else if (scroll == 1) {
            // Step 2

        } else if (scroll == 2) {
            // Step 3

        } else if (scroll == 3) {
            // Step 4

        } else if (scroll == 4) {
            // Step 5

        }
    })
</script>