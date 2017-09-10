import * as d3   from 'd3'
import donut     from './donut.js'
import bar       from './bar.js'
import data      from '../data/anonymised.csv'
import {uniq, map}  from 'lodash'

console.log(data);

document.addEventListener('DOMContentLoaded', _ => {
	const labels = ['Unknown', 'Male', 'Female', 'Non-binary']

	d3.select("#results").selectAll("*").remove()
	
	donut(d3.select('#results'), labels.map(
		label => ({
			label,
			value: data
				.filter(d => label === decode_pronoun_to_label(d.Pronoun))
				.length
		})
	))

	const topics = uniq(data.map(d => d.Topic))
	bar(d3.select('#results'), topics.map(
		topic => ({
			'Title': topic,
			'Unknown': data.filter(d => d.Topic === topic && 'Unknown' == decode_pronoun_to_label(d.Pronoun)).length,
			'Male':data.filter(d => d.Topic === topic && 'Male' == decode_pronoun_to_label(d.Pronoun)).length,
			'Female':data.filter(d => d.Topic === topic && 'Female' == decode_pronoun_to_label(d.Pronoun)).length,
			'Non-binary':data.filter(d => d.Topic === topic && 'Non-binary' == decode_pronoun_to_label(d.Pronoun)).length 
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
