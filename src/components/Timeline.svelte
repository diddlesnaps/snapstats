<script>
	// @ts-check
    import { onMount } from 'svelte';
    import { shuffle, MersenneTwister19937 } from 'random-js';
    import Chart from 'chart.js';
    import Rainbow from 'color-rainbow';

    /** @type {(title: string) => string} */
    export let getLegendItem = (title) => title;
    /** @type {{
        items?: { _id?: string; date?: string; total?: number; count?: number; }[];
        counts?: { _id?: string; date?: string; total?: number; count?: number; }[];
        _id?: string;
        title?: string;
        name?: string;
    }[]} */
    export let data;
    /** @type {string} */
    export let title;
    /** @type {HTMLCanvasElement} */
    let chart;
    /** @type {any} */
    let legend = '';

    /** @type {string[]} */
    let colors = [];

    const twister = MersenneTwister19937.seed(823212621);

    /** @type {(array: string[]) => string[]} */
    const Randomise = (array) => shuffle(twister, array);
    colors = Randomise(Rainbow.create(data.length).map((color) => color.hexString()))

    function sortNames(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1
        }
        return 0;
    }

    onMount(() => {
        let timelineChart = new Chart(chart, {
            type: 'line',
            data: {
                datasets: data.map((line, idx) => {
                    let items = line.counts || line.items;
                    let chartItems = items?.map(item => ({
                        x: new Date(item.date ?? item._id ?? 0),
                        y: item.count ?? item.total ?? 0,
                    })).sort((a, b) => a.x.getTime() - b.x.getTime()) ?? [];
                    return {
                        label: line._id ?? line.title ?? line.name,
                        backgroundColor: colors[idx],
                        borderColor: colors[idx],
                        borderWidth: 1,
                        pointRadius: 1,
                        lineTension: 0.2,
                        fill: false,
                        data: chartItems,
                    };
                }),
            },
            options: {
                animation: { duration: 0 },
                hover: { animationDuration: 0 },
                responsiveAnimationDuration: 0,
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear',
                        time: {
                            unit: 'day',
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                legend: {
                    display: false,
                },
                legendCallback: (chart) => {
                    /** @type {string[]} */
                    let text = [];
                    text.push('<ul>');
                    for (let i = 0; i < (chart.data.datasets?.length ?? 0); i++) {
                        text.push(`<li class="legend-item">
                            <span class="line" style="background-color: ${colors[i]}"></span>
                            ${getLegendItem(chart.data.datasets?.[i].label ?? '')}
                        </li>`);
                    }
                    text.push('</ul>');
                    return text.join('');
                },
            }
        });
        legend = timelineChart.generateLegend();
    });
</script>

<style>
    :global(.legend ul) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    :global(.legend-item) {
        list-style: none;
        width: 10rem;
        padding-left: 0;
    }
    :global(.legend-item .line) {
        display: inline-block;
        width: 2rem;
        height: 2px;
        vertical-align: middle;
    }
</style>

<h3>{title}</h3>
<canvas bind:this={chart} width="1000" height="500" class="chart"></canvas>
<div class="legend">
    {@html legend}
</div>
