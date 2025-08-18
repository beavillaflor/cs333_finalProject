<script>
    import Scroll from "./Scroll.svelte";
    import Plot from "./Plot.svelte";

    let value;
    const nsteps = 6
    const steps = Array.from(Array(nsteps).keys())

    let size = 20;
	let spacing = 40;
    let column = 10;
	let rows = 10;
    let padding = 20; 

    let text = [
        "Data from OpenDoors shows a nearly year-on-year increase of international students coming to the United States.",
        "But who are these students, and where do they come from?",
        "Text 3",
        "Text 4",
        "Text 5",
        "Text 6",
    ];
</script>

<section>
    <div class='hero'>
        <h1>Internationals Incoming</h1>
    </div>
    <div class="section-container">
        <div class="steps-container">
            <Scroll bind:value>
                {#each steps as step, i}
                    <div class="step" class:active={value === i}>
                        <div class="step-content">{text[i]}</div>
                    </div>
                {/each}
                <div class="spacer"></div>
            </Scroll>
        </div>
        <div class="sticky">
            <Plot scrollIndex={value}/>
        </div>
    </div>
    <div class='hero'>
        <h1>The End!</h1>
    </div>
</section>

<style>
	:global(body) {
		overflow-x: hidden;
	}

    * {
        font-family: monospace;
    }
	
	.hero {
		height: 40vh;
		display: flex;
		place-items: center;
		flex-direction: column;
		justify-content: center;
		text-align: center;
        font-size: 48px;
	}
	
	.hero h2 {
		margin-top: 0;
		font-weight: 200;
	}
	
    .spacer {
        height: 40vh;
    }

    .sticky {
        position: sticky;
        top: 10%;
        flex: 1 1 60%;
        width: 60%;
        height: 20%;
    }

    .section-container {
        margin-top: 1em;
        text-align: center;
        transition: background 100ms;
        display: flex;
    }

    .step {
        height: 80vh;
        display: flex;
        place-items: center;
        justify-content: center;
    }

    .step-content {
        font-size: 18px;
        line-height: 24px;
        padding: .5rem 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: background 500ms ease;
        text-align: left;
        width: 75%;
        margin: auto;
        max-width: 500px;
    }

	.step.active .step-content {
		background: white;
		color: black;
	}
	
    .steps-container,
    .sticky {
        height: 100%;
    }

    .steps-container {
        flex: 1 1 40%;
        z-index: 10;
    }
	
    @media screen and (max-width: 768px) {
        .section-container {
            flex-direction: column-reverse;
        }
        .sticky {
            width: 95%;
                margin: auto;
        }
    }
</style>
