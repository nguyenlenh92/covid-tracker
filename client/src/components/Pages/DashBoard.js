import React, { useState, useEffect } from 'react'
import Loading from '../Loading'
import ProgressBar from "react-bootstrap/ProgressBar"
import formatDate from '../../utils/utils'
import "./DashBoard.css"


const COVIDACTNOW_API_KEY = process.env.REACT_APP_COVIDACTNOW_APIKEY;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

export default function CountyDashBoard(props) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState() 
    const numDecimals = 2


    const RISK = {
        0: "LOW",
        1: "MEDIUM",
        2: "HIGH",
        3: "VERY HIGH"
    }

    useEffect(() => {   
        async function fetchCounty(){
            var nextDay = new Date()
            nextDay.setDate(props.current_date.getDate() - 1)
            nextDay.setMonth(props.current_date.getMonth())
            nextDay.setUTCHours(-5)
            var county = parseInt(props.county_fips)
            var state = parseInt(props.state_fips)
            var state_covidactnow = state.toString()

            if (props.county_fips > 1000){
                county = props.county_fips.replace(props.state_fips, "")
            }

            state_covidactnow = new Intl.NumberFormat('en', {minimumIntegerDigits:2}).format(state)
            county = new Intl.NumberFormat('en', {minimumIntegerDigits:3}).format(county)

            Promise.all([
                fetch(`${BACKEND_URL}/api/county/covid-cases/${state}${county}`),
                fetch(`${BACKEND_URL}/api/county/death-cases/${state}${county}`),
                fetch(`${BACKEND_URL}/api/county/vaccine-cases/${state}${county}`),
                fetch(`${BACKEND_URL}/api/county/${state}${county}`),
                fetch(`${BACKEND_URL}/api/case-range?min_day=${formatDate(nextDay)}&max_day=${formatDate(props.current_date)}&county_fips=${state}${county}`),
                fetch(`https://api.covidactnow.org/v2/county/${state_covidactnow}${county}.json?apiKey=${COVIDACTNOW_API_KEY}`)
            ]).then(responses => {return Promise.all(responses.map((res) => {return res.json()}))})
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
        }
        fetchCounty()
    }, [])

    if (loading){
        return <Loading />
    }
    else {
        return (
            <div className="county-container">
                <h1>{data[3].name}</h1>
                <div className="county-data-container">
                    <div className="county-data">
                        <h2>Population</h2>
                        <h3 className="strong">{data[3].population}</h3>
                    </div> 

                    <div className="county-data">
                        <h2>Confirmed cases</h2>
                        <h3 className="strong">{data[0].cases}</h3>
                    </div>

                    <div className="county-data">
                        <h2>Confirmed deaths</h2>
                        <h3 className="strong">{data[1].cases}</h3>
                    </div>
      
                    <div className="county-data">
                        <h2>Vaccine Progress</h2>
                        <h3><ProgressBar now={ data[2].cases / data[3].population * 100} /></h3>
                    </div>    
              
                </div>
                
                <div className="county-data-container">
                    <div className="county-data">
                        <h2>Daily new cases</h2>
                        <h3 className="strong">{ (data[4][1].cases - data[4][0].cases)}</h3>
                    </div>

                    <div className="county-data">
                        <h2>Vulnerability Level</h2>
                        <h3 className="strong">{ RISK[data[5].riskLevels.overall]}</h3>
                    </div>

                    <div className="county-data">
                        <h2>% Vaccines</h2>
                        <h3 className="strong">{ (data[2].cases / data[3].population * 100).toFixed(numDecimals)}</h3>
                    </div>
                </div> 
            </div>
        )
    }
}