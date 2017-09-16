import {
	sum,
	values,
	uniq,
	flatMap,
	keys,
	sortBy}    from 'lodash'
import * as d3 from 'd3'

export default function($root, data) {
	const w = $root.node().clientWidth, h = data.length * 30

	let $svg = $root.append('svg')
		.attr('width', w)
		
	const $g = $svg.append('g')
		.attr('transform', `translate(${w}, 50)`)

	let y = d3.scaleBand()
		.rangeRound([0, h])
		.padding(0.2)
		.align(0.7)

	const scale_width = Math.min(400, w)

	let x = d3.scaleLinear()
		.rangeRound([0, scale_width])

	data.columns = sortBy(
		// Get an array of unique column names
		uniq(flatMap(data, d => keys(d.value))),
		// Sort by which of these has the least entries
		label => sum(data.map(d => -d.value[label]))
	)
	
	let stack = d3.stack()
		.offset(d3.stackOffsetExpand)
		.keys(data.columns)

	let sort_by = data.columns[0]

	function total(d) {
		return sum(values(d.value))
	}

	function sort(a, b) {
		const idx = data.columns.indexOf(sort_by)
		return -(b.value[data.columns[idx]] / total(b) - a.value[data.columns[idx]] / total(a))
	}

	data.sort(sort)

	y.domain(data.map(d => d.label))

	// Series

	let $serie = $g.selectAll('.serie')
		.data(stack(data.map(d => d.value)))
		.enter()
		.append('g')
		.attr('class', (d, idx) => `serie -color-${idx}`)

	let $series_rect = $serie.selectAll('rect')
		.data(d => d)
		.enter()
		.append('rect')

	let $tip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)

	$series_rect
		.attr('y', (_, idx) => y(data[idx].label))
		.attr('x', d => -x(d[1]))
		.attr('width', d => - (x(d[0]) - x(d[1])))
		.attr('height', y.bandwidth())
		.attr('transform', `translate(${scale_width}, 0)`)
		.on('mousemove', function(d, idx) {
			let rect = d3.select(this)
			let key  = d3.select(this.parentNode).datum().key
			rect.classed('-hover', true)

			$tip
				.html(`<strong>${key}</strong>  ${Math.round((d[1] - d[0]) * 100)}% <span class="fraction"><span class="numerator">${data[idx].value[key]}</span><span class="symbol">/</span><span class="denominator">${total(data[idx])}</span></span>`)
				.style('left', `${event.pageX + 30}px`)
				.style('top', `${event.pageY - 30}px`)
				.transition()
				.duration(50)
				.style('opacity', 0.9)
		})
		.on('mouseout', function(d) {
			d3.select(this).classed('-hover', false)
			$tip
				.transition()
				.duration(100)
				.style('opacity', 0)
		})

	// Axis labels

	let $y_axis_labels = $g.append('g')
		.attr('class', 'axis axis--y')

	$y_axis_labels
		.call(d3.axisLeft(y))
		.selectAll('text')
		.attr('height', h)
		.attr('class', 'y-axis-label')

	$g.append('g')
		.attr('class', 'axis axis--x')
		.call(d3.axisBottom(x).ticks(10, '%'))
		.attr('transform', `translate(0, ${h})`)

	// Legend
	let $legend = $serie.append('g')
		.attr('class', 'legend bar')

	let $legends = $legend.append('g')
		.style('font-size', '10px')
		.on('mouseover', function(d) {
			d3.select(this).classed('-hover', true)
		})
		.on('mouseout', function (d) {
			d3.select(this).classed('-hover', false)
		})
		.on('mousedown', function(d) {
			d3.select(this).text()
			$legends
				.classed('-selected', legend => d == legend)
			sort_by = d.key
			data.sort(sort)
			y.domain(data.map(d => d.label))
			$series_rect
				.transition()
				.duration(600)
				.attr('y', d => y(data.find(datum => datum.value == d.data).label))
			$y_axis_labels
				.transition()
				.duration(600)
				.call(d3.axisLeft(y))
		})


	const $legends_text = $legends
		.append('text')
		.text(d => d.key)
		.attr('fill', 'black')

	const margin_for_indicator = 10 + 10

	let total_text_length = d3.sum($legends_text.nodes(), l => l.getComputedTextLength() + margin_for_indicator)
	let x_offset = total_text_length

	let max_text_height = d3.max($legends_text.nodes(), l => l.getBBox().height)
	$legends.append('path')
		.attr('d', d3.symbol().type(d3.symbolTriangle))
		.attr('transform', `translate(-10, -4)`)

	function update(e) {
		// Update legend label positions
		$legend
			.attr('transform', function(d, idx) {
				let x_pos = d3.select(this).select('text').node().getComputedTextLength() + margin_for_indicator
				x_offset = x_offset - x_pos
				return `translate(${(x_offset/total_text_length) * (scale_width-40) + 20 + margin_for_indicator}, 0)`
			})

		// Update size of canvas
		const bbox = $g.node().getBBox()
		$svg
			.attr('height', bbox.height)
			.attr('viewBox', `${w-$y_axis_labels.node().getBBox().width} ${-h+bbox.height} ${bbox.width} ${bbox.height}`)
			.attr('preserveAspectRatio', 'xMidYMid meet')
	
	}

	update()

	return update;
}
