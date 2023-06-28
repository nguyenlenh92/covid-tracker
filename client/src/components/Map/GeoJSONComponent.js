import React, { useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import formatDate from '../../utils/utils';
import { changeurl } from "../../actions"
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const defaultPopupStyle = {
    closeButton: false, offset: [0, -20], autoPan: false
}


export default function GeoJSONComponent(props) {

    const [redirect, setRedirect] = useState(false)
    const [stateID, setStateID] = useState("")
    const dispatch = useDispatch()
    // const [dateRange, setDateRange] = useState([new Date(2021, 10, 29), new Date(2021, 10, 30)])

    const Options = {
        COVID_CASES: 0,
        DEATH_CASES: 1,
        VACCINE_CASES: 2,
        POPULATION: 3,
        RANGE: 4
    }

    const DATE_RANGE = {
        EARLIER: 0,
        LATER: 1
    }



    const getColor = (cases, colorCoding) => {
        switch(colorCoding) {
            case Options.COVID_CASES:
                return cases > 200 ? '#800026' :
                    cases > 150  ? '#BD0026' :
                    cases > 100  ? '#E31A1C' :
                    cases > 80  ? '#FC4E2A' :
                    cases > 70  ? '#FD8D3C' :
                    cases > 50  ? '#FEB24C' :
                    cases > 40  ? '#FED976' :
                    cases > 20 ? '#FFEDA0' :
                                    '#ffffcc';

            case Options.DEATH_CASES:
                return cases > 1 ? '#4d004b' :
                    cases > 0.9 ? '#810f7c' :
                    cases > 0.8  ? '#88419d' :
                    cases > 0.7  ? '#8c6bb1' :
                    cases > 0.6  ? '#8c96c6' :
                    cases > 0.5  ? '#9ebcda' :
                    cases > 0.4  ? '#bfd3e6' :
                    cases > 0.2 ? '#e0ecf4' :
                                '#f7fcfd';

            case Options.VACCINE_CASES:
                return cases > 60 ? '#49006a' :
                    cases > 50  ? '#7a0177' :
                    cases > 40  ? '#ae017e' :
                    cases > 30  ? '#dd3497' :
                    cases > 20  ? '#f768a1' :
                    cases > 15  ? '#fa9fb5' :
                    cases > 10  ? '#fcc5c0' :
                    cases > 5 ? '#fde0dd' :
                                '#fff7f3';

            default:
                return cases > 0.9 ? '#023858' :
                    cases > 0.8  ? '#045a8d' :
                    cases > 0.7  ? '#0570b0' :
                    cases > 0.6  ? '#3690c0' :
                    cases > 0.5  ? '#74a9cf' :
                    cases > 0.4  ? '#a6bddb' :
                    cases > 0.3  ? '#d0d1e6' :
                    cases > 0.2 ? '#ece7f2' :
                                '#fff7fb';

        }
    }

    const style = (cases, colorCoding) => {
        return {
            fillColor: getColor(cases, colorCoding),
        }
    }

    const initialStyle = () => {
        return {
            weight: 0.5,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        }
    }

    const calcPercent = (endCase, totalPop) => {
        return ((endCase / totalPop) * 100).toFixed(2)
    }

    const calcPerCapita = (endCase, totalPop) => {
        return ((endCase / totalPop) * 100000).toFixed(2)
    
    }

    const calcDailyCasePerCapita = (startCase, endCase, totalPop) => {
        return ((endCase - startCase) / totalPop * 100000).toFixed(2)
    }



    const onEachFeature = (feature, layer) => {
        if (props.type === "country"){
            var popUpContent = "State: " + feature.properties.NAME + "<br/>"
            var promises_array = []
            if (props.colorCoding === Options.COVID_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/state/covid-cases/${feature.properties.STATE}`),
                    fetch(`${BACKEND_URL}/api/case-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&state_fips=${feature.properties.STATE}`)
                ]
            }

            else if (props.colorCoding === Options.DEATH_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/state/death-cases/${feature.properties.STATE}`),
                    fetch(`${BACKEND_URL}/api/death-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&state_fips=${feature.properties.STATE}`)
                ]
            }

            else if (props.colorCoding === Options.VACCINE_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/state/vaccine-cases/${feature.properties.STATE}`),
                    fetch(`${BACKEND_URL}/api/vaccine-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&state_fips=${feature.properties.STATE}`)
                ]
            }


            Promise.all(
                [fetch(`${BACKEND_URL}/api/state/${feature.properties.STATE}`)].concat(promises_array)
        
        ).then(responses => {return Promise.all(responses.map((res) => {return res.json()}))})
            .then(data => {
                let msg = "Population: " + data[0].population
                if (props.colorCoding === Options.COVID_CASES){
                    msg +=
                    "<br/>Total cases YTD: " + data[1].cases +
                    "<br/>Total cases per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New cases per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
                }
                
                else if (props.colorCoding === Options.DEATH_CASES){
                    msg +=
                    "<br/>Total deaths YTD: " + data[1].cases +
                    "<br/>Total deaths per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New deaths per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
                }

                else if (props.colorCoding === Options.VACCINE_CASES){
                    msg +=
                    "<br/>Total vaccinations YTD: " + data[1].cases + 
                    "<br/>Total vaccinations per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New vaccinations per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population) +
                    "<br/>Vaccine Progress: " + calcPercent(data[2][DATE_RANGE.LATER].cases, data[0].population) + "%"
                }

                layer.bindPopup(popUpContent + msg
                // "COVID cases: " + data[Options.COVID_CASES].cases +
                // "<br/>Death cases: " + data[Options.DEATH_CASES].cases +
                // "<br/>Vaccine cases: " + data[Options.VACCINE_CASES].cases +
                // "<br/>Population: " + data[3].population +
                // "<br/>Total Cases per capita (100K): " + calcPerCapita(data[Options.RANGE][DATE_RANGE.LATER].cases, data[Options.POPULATION].population) +
                // "<br/>New cases per capita(100K): " + calcNewDailyCasePerCapita(data[Options.RANGE][DATE_RANGE.EARLIER].cases, data[Options.RANGE][DATE_RANGE.LATER].cases, data[Options.POPULATION].population) +
                // "<br/>Infection Rate: " + calcInfectionRate(data[Options.RANGE][DATE_RANGE.LATER].cases, data[Options.POPULATION].population)
                , defaultPopupStyle)

                if (props.colorCoding === Options.VACCINE_CASES){
                    return calcPercent(data[2][DATE_RANGE.LATER].cases, data[0].population)
                }
                return calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
            })
            .then(data => {
                layer.setStyle(style(data, props.colorCoding))
            })
            .catch(err => console.error(err))
        }

        else if (props.type === "state"){
            popUpContent = feature.properties.LSAD + ": " + feature.properties.NAME + "<br/>"

            if (props.colorCoding === Options.COVID_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/county/covid-cases/${feature.properties.STATE}${feature.properties.COUNTY}`),
                    fetch(`${BACKEND_URL}/api/case-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&county_fips=${feature.properties.STATE}${feature.properties.COUNTY}`)
                ]
            }

            else if (props.colorCoding === Options.DEATH_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/county/death-cases/${feature.properties.STATE}${feature.properties.COUNTY}`),  
                    fetch(`${BACKEND_URL}/api/death-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&county_fips=${feature.properties.STATE}${feature.properties.COUNTY}`)
                ]
            }

            else if (props.colorCoding === Options.VACCINE_CASES){
                promises_array = [
                    fetch(`${BACKEND_URL}/api/county/vaccine-cases/${feature.properties.STATE}${feature.properties.COUNTY}`),
                    fetch(`${BACKEND_URL}/api/vaccine-range?min_day=${formatDate(props.date_range[DATE_RANGE.EARLIER])}&max_day=${formatDate(props.date_range[DATE_RANGE.LATER])}&county_fips=${feature.properties.STATE}${feature.properties.COUNTY}`)
                ]
            }
            Promise.all([fetch(`${BACKEND_URL}/api/county/${feature.properties.STATE}${feature.properties.COUNTY}`)].concat(promises_array)).then(responses => {return Promise.all(responses.map((res) => {return res.json()}))})
            .then(data => {

                let msg = "Population: " + data[0].population
                if (props.colorCoding === Options.COVID_CASES){
                    msg +=
                    "<br/>Total cases YTD: " + data[1].cases +
                    "<br/>Total cases per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New cases per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
                }
                
                else if (props.colorCoding === Options.DEATH_CASES){
                    msg +=
                    "<br/>Total deaths YTD: " + data[1].cases +
                    "<br/>Total deaths per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New deaths per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
                }

                else if (props.colorCoding === Options.VACCINE_CASES){
                    msg +=
                    "<br/>Total vaccinations YTD: " + data[1].cases + 
                    "<br/>Total vaccinations per capita (100K): " + calcPerCapita(data[1].cases, data[0].population) +
                    "<br/>New vaccinations per capita (100K): " + calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population) +
                    "<br/>Vaccine Progress: " + calcPercent(data[2][DATE_RANGE.LATER].cases, data[0].population) + "%"
                }
                layer.bindPopup(popUpContent + msg
                // "COVID cases: " + data[Options.COVID_CASES].cases +
                // "<br/>Death cases: " + data[Options.DEATH_CASES].cases +
                // "<br/>Vaccine cases: " + data[Options.VACCINE_CASES].cases +
                // "<br/>Population: " + data[3].population +
                // "<br/>Cases per capita: " + data[Options.COVID_CASES].cases / data[3].population +
                // "<br/>Infection Rate " + calcInfectionRate(data[4][0].cases, data[4][1].cases, data[3].population, data[Options.COVID_CASES].cases)
                , defaultPopupStyle)

                if (props.colorCoding === Options.VACCINE_CASES){
                    return calcPercent(data[2][DATE_RANGE.LATER].cases, data[0].population)
                }
                return calcDailyCasePerCapita(data[2][DATE_RANGE.EARLIER].cases, data[2][DATE_RANGE.LATER].cases, data[0].population)
            })
            .then(data => {
                layer.setStyle(style(data, props.colorCoding))
            })
            .catch(err => console.error(err))
        }



        layer.on({
            mouseover: highlightFeature.bind(this),
            mouseout: resetHighlight.bind(this),
            click: focusOnState.bind(this)
        });


    }

    const highlightFeature = (e) => {
        var layer = e.target;
        layer.setStyle({color: "black"});
        layer.openPopup();
    }

    const resetHighlight = (e) => {
        var layer = e.target;
        layer.setStyle({color: 'white'});
        layer.closePopup();
    }

    const focusOnState = (e) => {

        var state = e.target.feature.properties.STATE
        var county = e.target.feature.properties.COUNTY

        if (state && !county){
            setStateID(state)
            setRedirect(true)
        }
        if (props.parentCallBack){
            props.parentCallBack(county)
        }
    }

    if (redirect && stateID){
        dispatch(changeurl(`/state?state_fips=${stateID}`))
        return <Redirect to={`/state?state_fips=${stateID}`}/>
    }


    return (
        <div>
            <GeoJSON key={props.colorCoding + (Date.parse(props.date_range[1]) - Date.parse(props.date_range[0]))} data={props.data} onEachFeature={onEachFeature} style={initialStyle} />
        </div>
    )
}
