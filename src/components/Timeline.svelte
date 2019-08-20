<script>
    import { onMount } from 'svelte';
    import { shuffle, MersenneTwister19937 } from 'random-js';
    import Rainbow from 'color-rainbow';
	import * as d3 from 'd3';

    export let data;
    export let title;
    let chart;
    
    let svg, x, y, xAxis, yAxis, dim, chartWrapper, line, width, height, margin = {};
    let paths = [], colors = [];

    const twister = MersenneTwister19937.seed(823212621);
    const parseTime = d3.timeParse("%Y-%m-%d");

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

    let TimelineCounts = data.map(line => {
        let items = line.counts || line.items;
        items = items.map(item => ({
            date: parseTime(item._id || item.date),
            count: item.total || item.count,
        })).sort((a, b) => a.date - b.date);
        return {
            name: line._id || line.title || line.name,
            items,
        };
    }).sort((a, b) => sortNames(a.name.toUpperCase(), b.name.toUpperCase()));

    let xExtent;
    let yExtent;

    for (let l of TimelineCounts) {
        let [xmin, xmax] = d3.extent(l.items, d => d.date);
        let [ymin, ymax] = d3.extent(l.items, d => d.count);

        if (!xExtent) {
            xExtent = [xmin, xmax];
        } else {
            if (xmin < xExtent[0]) {
                xExtent[0] = xmin;
            }
            if (xmax > xExtent[1]) {
                xExtent[1] = xmax;
            }
        }
        if (!yExtent) {
            yExtent = [ymin, ymax];
        } else {
            if (ymin < yExtent[0]) {
                yExtent[0] = ymin;
            }
            if (ymax > yExtent[1]) {
                yExtent[1] = ymax;
            }
        }
    }

    x = d3.scaleTime().domain(xExtent);
    y = d3.scaleLinear().domain(yExtent);

    xAxis = d3.axisBottom();
    yAxis = d3.axisLeft();

    line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count));

	onMount(() => {
        svg = d3.select(chart);
        chartWrapper = svg.append('g');
        for (let lineData of TimelineCounts) {
            paths.push(chartWrapper.append('path').datum(lineData.items).classed('line', true));
        }
        chartWrapper.append('g').classed('x axis', true);
        chartWrapper.append('g').classed('y axis', true);

        render();
    });
    
    function render() {
        updateDimensions(chart.parentElement.offsetWidth);

        x.range([0, width]);
        y.range([height, 0]);

        svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        chartWrapper.attr('transform', `translate(${margin.left}, ${margin.top})`);

        xAxis.scale(x);
        yAxis.scale(y);

        svg.select('.x.axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);
        
        svg.select('.y.axis')
            .call(yAxis);

        for (let i in paths) {
            paths[i].attr('d', line)
                .attr('stroke-width', '2px')
                .attr('stroke', colors[i])
                .attr('fill', 'none');
        }
    }

    function updateDimensions(winWidth) {
        margin.top = 20;
        margin.right = 50;
        margin.left = 50;
        margin.bottom = 50;

        width = winWidth - margin.left - margin.right;
        height = .625 * width;
    }
</script>

<style>
    .legend ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    .legend-item {
        list-style: none;
        width: 10rem;
        padding-left: 0;
    }
    .legend-item .line {
        display: inline-block;
        width: 2rem;
        height: 2px;
        vertical-align: middle;
    }
</style>

<svelte:window on:resize={render} />
<svg bind:this={chart} width="1000" height="500" class="chart"></svg>
<div class="legend">
    <ul>
        {#each TimelineCounts as item, i}
        <li class="legend-item">
            <span class="line" style={`background-color: ${colors[i]}`} />
            {item.name}
        </li>
        {/each}
    </ul>
</div>
