import * as d3 from 'd3'
import donut   from './donut.js'
import bar     from './bar.js'

document.addEventListener('DOMContentLoaded', _ => {
	const labels = ['Unknown', 'Male', 'Female', 'Non-binary']
	const data = labels.map(label => ({ label: label, value: Math.random() }))

	d3.select("#results").selectAll("*").remove()
	
	donut(d3.select('#results'), data)
	bar(d3.select('#results'), data)
})
