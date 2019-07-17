import * as d3 from 'd3'
import donut from './donut.js'
import bar from './bar.js'
import { uniq, zipObject }
	from 'lodash'
import { html, render } from 'lit-html'

// Uses webpack CSV loader
import unprocessed_data_2018 from '../data/anonymised.csv'
import unprocessed_data_2019 from '../data/anonymised_2.csv'

// The groups on the charts
// Not definitive list of genders in the world ^^
const genders = ['Unknown', 'Male', 'Female', 'Non-binary']

// Don't add charts until page has loaded
document.addEventListener('DOMContentLoaded', _ => {
	const unprocessed_data = {
		2018: unprocessed_data_2018,
		2019: unprocessed_data_2019,
	};

	function update(year) {
		create_ui_for_data(unprocessed_data[year])

		const radio = (key, label) => html`
			<label class=${year === key ? 'selected' : ''}>
				<input type="radio" ?checked=${year === key} @click=${(e) => {
				e.preventDefault();
				update(key);
			}} />
				${label}
			</label>
		`

		const select_data = html`
			<p>Select dataset range (inclusive): ${radio('2018', "2012–2016")} ${radio('2019', '2012–2019')}</p>
		`

		render(select_data, document.querySelector('#controls'))
	}

	update('2018')
})


function create_ui_for_data(unprocessed_data) {
	// Add normalized gender field to data from CSV file
	const data = unprocessed_data.map(d => ({
		'Gender': decode_pronoun_to_label(d.Pronoun),
		...d,
	}))

	const $results = d3.select("#results")
	$results.selectAll("*").remove()

	$results.append('div').attr('id', 'controls')

	$results.append('h3').text('Overall gender composition across dataset').attr('id', 'overall_gender_composition')
	$results.append('h3').text('Gender composition across conference topics').attr('id', 'composition_across_topics')
	$results.append('h3').text('Gender composition across conference years').attr('id', 'composition_across_years')
	$results.append('h3').text('Gender composition across the different presentation types').attr('id', 'composition_across_types')
	$results.append('h3').text('Gender composition across relative author positions in presentations').attr('id', 'composition_across_positions')
	$results.append('h3').text('Gender composition of single authors vs multi-authored presentations across all conferences').attr('id', 'composition_author_count')

	const charts = [
		// Fig. 2 Overall gender composition across dataset.
		donut($results, '#overall_gender_composition', genders.map(
			label => ({
				label,
				value: data.filter(d => label === d.Gender).length
			})
		)),

		// Fig 3. Gender composition of AES conference across each year, where the number on the right is the population size for each year.
		bar($results, '#composition_across_topics', grouped_by_selector(data, 'Topic')),
		// Fig. 4 Gender composition across conference topics, where the number on the right is the population size for each topic.
		bar($results, '#composition_across_years', grouped_by_selector(data, 'Year')),
		// Fig 5. Gender composition across the different presentation types, where the asterisk indicates an ‘invited’ paper and number on the right is the population size for each presentation type.
		bar($results, '#composition_across_types', grouped_by_selector(data, 'Grouped Type')),
		// Fig. 6 Gender composition across relative author positions in presentations where the number on the right is the population size for each author position.
		bar($results, '#composition_across_positions', grouped_by_selector(
			data.filter(d => d['Inc. for author pos?'] === 'TRUE'), 'Position (relative)')),
		// Fig. 7 Gender composition of single authors vs multi-authored presentations across all conferences, where the number on the right is the population size for each authorship type.
		bar($results, '#composition_author_count', grouped_by_selector(
			data.filter(d => d['Inc. for single/multiauthor?'] === 'TRUE'), 'Single/multi author')),
	]

	// Responsive design
	window.addEventListener('resize', e => {
		// Don't use .getElementsById because HTMLCollection doesn't implement
		// iterator methods
		const svgs = document.querySelectorAll('svg')
		const width = Math.min(900, document.getElementById('results').clientWidth)

		for (let svg of svgs) {
			const ratio = svg.getAttribute('width') / svg.getAttribute('height')
			svg.setAttribute('width', width)
			svg.setAttribute('height', width / ratio)
		}

		charts.forEach(chart => chart(e))
	})
}

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
		they: 'Non-binary',
		he: 'Male',
		she: 'Female',
		'he/they': 'Non-binary',
		'she/they': 'Non-binary',
	}[pronoun.toLowerCase()]) || 'Unknown'
}
