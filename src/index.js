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

	// Fig. 2 Overall gender composition across dataset.
	donut($results, genders.map(
		label => ({
			label,
			value: data.filter(d => label === d.Gender).length
		})
	))

	// Fig 3. Gender composition of AES conference across each year, where the number on the right is the population size for each year.
	bar($results, data_grouped_by_selector('Topic'))
	// Fig. 4 Gender composition across conference topics, where the number on the right is the population size for each topic.
	bar($results, data_grouped_by_selector('Year'))
	// Fig 5. Gender composition across the different presentation types, where the asterisk indicates an ‘invited’ paper and number on the right is the population size for each presentation type.
	bar($results, data_grouped_by_selector('Grouped Type'))

	// Fig. 6 Gender composition across relative author positions in presentations where the number on the right is the population size for each author position.
	// Fig. 7 Gender composition of single authors vs multi-authored presentations across all conferences, where the number on the right is the population size for each authorship type.
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
