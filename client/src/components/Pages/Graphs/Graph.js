import React, { useEffect,useState } from 'react'
import CanvasJSReact from './canvasjs.react.js'
import Loading from '../../Loading'
import axios from "axios"
import "./Graphs.css"

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

function Graph (props) {

	const [datapoints, setDataPoints ] = useState()
	const [ loading, setLoading] = useState(true)
	const [ ydata, setYData ] = useState([])
	const colorOptions = [
		"#2CA02C",
		"#FF7F0E",
		"#1F77B4",
		"#9467BD",
		"#D62728"
	]

	useEffect(() => {
		if(props.type === "state"){
			axios.get(`${BACKEND_URL}/api/state/${props.graph_type}_graph/${props.state_fips}`).then(
				(response) => {
					var result = [1]
					result = response.data
					var array = []
					var y = []
					for(let i = 0; i < result.cases.length; i++){
						var newDate = new Date(result.cases[i].date)
						newDate.setUTCHours(5)
						array.push({x: newDate,y:result.cases[i].cases})
						y.push(result.cases[i].cases)
					}
					setDataPoints(array)
					setYData(y)

					}
				).finally(() => {
					setLoading(false)
				})
		}
	}, [])

if (loading){
		return <Loading />
	}

	return (
		<div className="graph-container">
			{ datapoints && <CanvasJSChart options = {
				{

				animationEnabled: true,
				exportEnabled: true,
				theme: "light1", //"light1", "dark1", "dark2"
				title:{
					text: (`State ${props.graph_type} Data`).toUpperCase()
				},
				axisY: {
					includeZero: true,
					minimum: Math.min(...ydata),
					maximuml: Math.max(...ydata),
					interval: (parseInt((Math.max(...ydata) - Math.min(...ydata)) / 10)),
					title: "Cases"
				},
				axisX: {
					title: "Timeline",
					gridThickness: 2,
				},

				data: [{
					type: "spline",
					color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
					indexLabelFontColor: "#5A5757",
					dataPoints: datapoints
				}]
				}
			}

			/> }

		</div>
	);

}
export default Graph