<script>
    import { onMount } from 'svelte';
    import { shuffle, MersenneTwister19937 } from 'random-js';
    import Chart from 'chart.js';
    import Rainbow from 'color-rainbow';

    export let getLegendItem = (title) => title
    export let data;
    export let title;
    let chart;
    let legend = '';

    let colors = [];

    const twister = MersenneTwister19937.seed(823212621);

    const Randomise = (array) => shuffle(twister, array);
    colors = Randomise(Rainbow.create(data.length).map(color => color.hexString()))

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
        let ctx = chart.getContext('2d');
        let timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: data.map((line, idx) => {
                    let items = line.counts || line.items;
                    items = items.map(item => ({
                        x: new Date(item.date || item._id),
                        y: item.count || item.total,
                    })).sort((a, b) => a.x - b.x);
                    return {
                        label: line._id || line.title || line.name,
                        backgroundColor: colors[idx],
                        borderColor: colors[idx],
                        borderWidth: 1,
                        pointRadius: 1,
                        lineTension: 0.2,
                        fill: false,
                        data: items,
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
                    let text = [];
                    text.push('<ul>');
                    for (let i = 0; i < chart.data.datasets.length; i++) {
                        text.push(`<li class="legend-item">
                            <span class="line" style="background-color: ${colors[i]}"></span>
                            ${getLegendItem(chart.data.datasets[i].label)}
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
