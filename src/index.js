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

const genders = ['Unknown', 'Male', 'Female', 'Non-binary']

document.addEventListener('DOMContentLoaded', _ => {

	const $results = d3.select("#results")
	$results.selectAll("*").remove()
	
	donut($results, genders.map(
		label => ({
			label,
			value: data.filter(d => label === d.Gender).length
		})
	))

	bar($results, data_grouped_by_selector('Topic'))
	bar($results, data_grouped_by_selector('Year'))
	bar($results, data_grouped_by_selector('Grouped Type'))
})

function data_grouped_by_selector(selector) {
	return uniq(data.map(d => d[selector])).map(
		label => ({
			label,
			value: zipObject(
				genders,
				genders.map(g => data.filter(d => d[selector] === label && d.Gender === g).length)
			)
		})
	)
}

function decode_pronoun_to_label(pronoun) {
	return ({
		'he': 'Male',
		'she': 'Female',
		'they': 'Non-binary',
	}[pronoun.toLowerCase()]) || 'Unknown'
}
