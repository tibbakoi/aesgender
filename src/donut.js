import * as d3 from 'd3'

export default function($root, data) {
	const w = $root.node().clientWidth, h = 400

	const svg = $root
		.append('svg')
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

	// Slices

	const slices = g
		.select('.slices')
		.selectAll('path.slice')
		.data(pie(data), key)
		.enter()
		.insert('path')
		.attr('class', (d, idx) => `slice -color-${idx}`)
		.attr('d', d => arc(d))

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
		.text(d => d.data.label)
		.attr('transform', d =>
			`translate(${[
				radius * (midAngle(d) < Math.PI ? 1 : -1),
				outerArc.centroid(d)[1]
			]})`
		)
		.attr('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')

	// Label-lines

	const polyline = g
		.select('.lines')
		.selectAll('polyline')
		.data(pie(data), key)
		.enter()
		.append('polyline')
		.attr('points', d => [
			arc.centroid(d),
			outerArc.centroid(d),
			[
				radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1),
				outerArc.centroid(d)[1]
			]
		])

	const bbox = g.node().getBBox()
	svg
		.attr('height', bbox.height)
		.attr('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)

	return svg
}
