import * as d3   from 'd3'
import donut     from './donut.js'
import bar       from './bar.js'
import {uniq, zipObject}
                 from 'lodash'

import unprocessed_data from '../data/anonymised.csv'

// Add normalized gender field to data from CSV file
let data = unprocessed_data.map(d => ({
	'Gender': decode_pronoun_to_label(d.Pronoun),
	...d,
}))

// The groups on the charts
const genders = ['Unknown', 'Male', 'Female', 'Non-binary']

// Don't add charts until page has loaded
document.addEventListener('DOMContentLoaded', _ => {

	const $results = d3.select("#results")
	$results.selectAll("*").remove()

	let charts = [
		// Fig. 2 Overall gender composition across dataset.
		donut($results, genders.map(
			label => ({
				label,
				value: data.filter(d => label === d.Gender).length
			})
		)),

		// Fig 3. Gender composition of AES conference across each year, where the number on the right is the population size for each year.
		bar($results, grouped_by_selector(data, 'Topic')),
		// Fig. 4 Gender composition across conference topics, where the number on the right is the population size for each topic.
		bar($results, grouped_by_selector(data, 'Year')),
		// Fig 5. Gender composition across the different presentation types, where the asterisk indicates an ‘invited’ paper and number on the right is the population size for each presentation type.
		bar($results, grouped_by_selector(data, 'Grouped Type')),
		// Fig. 6 Gender composition across relative author positions in presentations where the number on the right is the population size for each author position.
		bar($results, grouped_by_selector(
			data.filter(d => d['Inc. for author pos?'] === 'TRUE'), 'Position (relative)')),
		// Fig. 7 Gender composition of single authors vs multi-authored presentations across all conferences, where the number on the right is the population size for each authorship type.
		bar($results, grouped_by_selector(
			data.filter(d => d['Inc. for sole/coauthor?'] === 'TRUE'), 'Single/multi author')),
	]

	// Responsive design
	window.addEventListener('resize', e => {
		// Don't use .getElementsById because HTMLCollection doesn't implement
		// iterator methods
		const svgs  = document.querySelectorAll('svg')
		const width = Math.min(750, document.getElementById('results').clientWidth)

		for (let svg of svgs) {
			const ratio = svg.getAttribute('width') / svg.getAttribute('height')
			svg.setAttribute('width', width)
			svg.setAttribute('height', width/ratio)
		}

		charts.forEach(chart => chart(e))
	})
})

// Returns a transformed version of the data grouped by a specific selector field
// i.e. all entries where the given field is the same will be grouped together
function grouped_by_selector(data, selector) {
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

// Converts from the pronouns stored in the CSV file into a 'Gender' field
// for grouping in the charts
function decode_pronoun_to_label(pronoun) {
	return ({
		he:   'Male',
		she:  'Female',
		they: 'Non-binary',
	}[pronoun.toLowerCase()]) || 'Unknown'
}
