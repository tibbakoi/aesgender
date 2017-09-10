import * as d3   from 'd3'
import donut     from './donut.js'
import bar       from './bar.js'
import data      from '../data/anonymised.csv'

console.log(data);

document.addEventListener('DOMContentLoaded', _ => {
	const labels = ['Unknown', 'Male', 'Female', 'Non-binary']

	d3.select("#results").selectAll("*").remove()
	
	donut(d3.select('#results'), labels.map(
		label => ({
			label,
			value: data
				.filter(entry => label === decode_pronoun_to_label(entry.Pronoun))
				.length
		})
	))
	bar(d3.select('#results'), data)
})

function decode_pronoun_to_label(pronoun) {
	return ({
		'he': 'Male',
		'she': 'Female',
		'they': 'Non-binary',
	}[pronoun.toLowerCase()]) || 'Unknown'
}
