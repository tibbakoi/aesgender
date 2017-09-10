import * as d3 from 'd3'
import donut   from './donut.js'
import bar     from './bar.js'
import data    from '../data/anonymised.csv'

document.addEventListener('DOMContentLoaded', _ => {
	const labels = ['Unknown', 'Male', 'Female', 'Non-binary']

	d3.select("#results").selectAll("*").remove()
	
	donut(d3.select('#results'), data)
	bar(d3.select('#results'), data)
})
