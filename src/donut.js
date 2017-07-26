import * as d3 from 'd3'

export default function(root, data) {
	const w = 400, h = 400

	const svg = root
		.append('svg')
		.attr('width', w)
		.attr('height', h)
		.attr('viewBox', `0 -${h/2} ${w} ${h}`)
		.append('g')

	svg.append('g').attr('class', 'slices')
	svg.append('g').attr('class', 'labels')
	svg.append('g').attr('class', 'lines')

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

	const slices = svg
		.select('.slices')
		.selectAll('path.slice')
		.data(pie(data), key)
		.enter()
		.insert('path')
		.attr('class', (d, idx) => `slice -color-${idx}`)
		.attr('d', d => arc(d))
		.exit()
		.remove()

	// Labels

	function midAngle(d) {
		return d.startAngle + (d.endAngle - d.startAngle)/2
	}

	const text = svg
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
		.exit()
		.remove()


	// Label-lines

	const polyline = svg
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
		.exit()
		.remove()

	return svg
}
