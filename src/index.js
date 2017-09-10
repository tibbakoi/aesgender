import * as d3   from 'd3'
import donut     from './donut.js'
import bar       from './bar.js'
import {uniq, zipObject}
                 from 'lodash'

import unprocessed_data from '../data/anonymised.csv'

console.log('unp', unprocessed_data)

// Add normalized gender field
let data = unprocessed_data.map(d => ({
	'Gender': decode_pronoun_to_label(d.Pronoun),
	...d,
}))

document.addEventListener('DOMContentLoaded', _ => {
	const genders = ['Unknown', 'Male', 'Female', 'Non-binary']

	d3.select("#results").selectAll("*").remove()
	
	donut(d3.select('#results'), genders.map(
		label => ({
			label,
			value: data
				.filter(d => label === d.Gender)
				.length
		})
	))

	const topics = uniq(data.map(d => d.Topic))
	bar(d3.select('#results'), topics.map(
		label => ({
			label,
			value: zipObject(
				genders,
				genders.map(g => data.filter(d => d.Topic === label && d.Gender === g).length)
			)
		})
	))
})

function decode_pronoun_to_label(pronoun) {
	return ({
		'he': 'Male',
		'she': 'Female',
		'they': 'Non-binary',
	}[pronoun.toLowerCase()]) || 'Unknown'
}
