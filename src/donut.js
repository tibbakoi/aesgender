import {
	sum,
	values
}              from 'lodash'
import * as d3 from 'd3'

export default function($root, selector, data) {
	const w = $root.node().clientWidth, h = 400

	const svg = $root
		.insert('svg', `${selector} + *`)
		.attr('width', w)
		.attr('height', h)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		
	const g = svg.append('g')

	g.append('g').attr('class', 'slices')
	g.append('g').attr('class', 'labels')
	g.append('g').attr('class', 'lines')

	const radius = Math.min(w, h) / 2

	const pie = d3.pie()
		.value(d => d.value)

	const arc = d3.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.3)

	const outerArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9)

	const key    = d => d.data.label
	const labels = data.map(d => d.label)

	function total(d) {
		return sum(d.map(datum => datum.value))
	}

	let $tip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)

	// Slices

	const slices = g
		.select('.slices')
		.selectAll('path.slice')
		.data(pie(data), key)
		.enter()
		.insert('path')
		.attr('class', (d, idx) => `slice -color-${idx}`)
		.attr('d', d => arc(d))
		.on('mousemove', function(d, idx) {
			d3.select(this).classed('-hover', true)

			$tip
				.html(`<strong>${d.data.label}</strong>  ${Math.round(d.value/total(data) * 100)}% <span class="fraction"><span class="numerator">${d.value}</span><span class="symbol">/</span><span class="denominator">${total(data)}</span></span>`)
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

	// Labels

	function midAngle(d) {
		return d.startAngle + (d.endAngle - d.startAngle)/2
	}

	const text = g
		.select('.labels')
		.selectAll('text')
		.data(pie(data), key)
		.enter()
		.append('text')
		.attr('dy', '.35em')
		.text(d => `${d.data.label} (${d.data.value})`)
		.attr('transform', (d, idx) =>
			`translate(${[
				idx == 1 || idx == 3 ? radius : -radius,
				idx == 1 || idx == 2 ? radius : -radius,
			]})`
		)
		.attr('text-anchor', (d, idx) => idx == 1 || idx == 3 ? 'start' : 'end')

	// Label-lines

	const polyline = g
		.select('.lines')
		.selectAll('polyline')
		.data(pie(data), key)
		.enter()
		.append('polyline')
		.attr('points', (d, idx) => [
			arc.centroid(d),
			outerArc.centroid(d),
			[
				outerArc.centroid(d)[0],
				idx == 1 || idx == 2 ? radius : -radius,
			],
			[
				0.95* (idx == 1 || idx == 3 ? radius : -radius),
				idx == 1 || idx == 2 ? radius : -radius,
			]
		])

	function update(e) {
		const bbox = g.node().getBBox()
		svg
			.attr('height', bbox.height)
			.attr('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
	}

	update()

	return update
}
