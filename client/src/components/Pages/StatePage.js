import React, { useEffect, useState } from 'react'
import MapComponent from "../Map/MapComponent"
import BackButton from '../BackButton'
import Loading from "../Loading"
import RankingTable from '../RankingTable/RankingTable'
import DashBoard from './DashBoard'
import "./StatePage.css"
import Graph from './Graphs/Graph'

const StatePage = (props) => {
    const [state, setCurrentState] = useState([])
    const [coords, setCoords] = useState([37.8, -96])
    const [loading, setLoading] = useState(true)
    const [stateFips, setStateFips] = useState()
    const [countyFips, setCountyFips] = useState()
    const [currentDate, setCurrentDate] = useState(new Date(2021, 10, 30))
    const type = "state"
    const url = new URL(props.url)
    const filterState = async(data) => {
        
        var queryParams = await new URLSearchParams(window.location.search)
        
        return await [data.states.filter(state => state.fips == queryParams.get('state_fips')), props.geoJSON.features.filter(record => record.properties.STATE === queryParams.get('state_fips'))]
    }

    // const filterCounty = async() => {
    //     var queryParams = await new URLSearchParams(window.location.search)
    //     return await {county_fips: queryParams.get('county_fips'), state_fips: queryParams.get('state_fips')}
    // }


    useEffect(() => {
        async function fetchCoords(){
            const data = await import('../../data/states_latlng.json')
            filterState(data)
            .then(state => {
                setCurrentState(state[1])
                setStateFips(state[0][0].fips)
                var coords = [state[0][0].lat, state[0][0].lng]
                setCoords(coords)
            })
            .then(() => {
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
            })
        }



        // filterCounty()
        // .then(data => {
        //     console.log(data.county_fips, data.state_fips)
        //     setCountyFips(data.county_fips)
        //     setStateFips(data.state_fips)

        // })
        // .catch(err => {
        //     console.error(err)
        // })
        fetchCoords()

        const state = url.searchParams.get("state_fips")
        const county = url.searchParams.get("county_fips")
        setCountyFips(county)
        setStateFips(state)
    }, [])


    const handleCallBack = (county) => {
        setCountyFips(county)
    }

    const dateCallBack = (date) => {
        setCurrentDate(date)
    }

    if (loading){
        return <Loading />
    }

    return (
        <div className="StatePage" key={stateFips}>
            <BackButton />
            <MapComponent 
                center={coords} 
                data={state} 
                zoomLevel={6} 
                type={type}
                parentCallBack={handleCallBack}
                dateCallBack={dateCallBack}
            />
            {(countyFips && stateFips && currentDate) && <DashBoard key={parseInt(stateFips) + parseInt(countyFips)} current_date={currentDate} state_fips={stateFips} county_fips={countyFips} />}
            <RankingTable type={type} state_fips={stateFips} number_rows={1000} date={[new Date(2021, 10, 29), new Date(2021, 10, 30)]}/>
            <Graph type={type} state_fips={stateFips} key="cases" graph_type="cases" />
            <Graph type={type} state_fips={stateFips} key="vaccines" graph_type="vaccines" />
            <Graph type={type} state_fips={stateFips} key="deaths" graph_type="deaths" />
            
        </div>
    )
}

export default StatePage