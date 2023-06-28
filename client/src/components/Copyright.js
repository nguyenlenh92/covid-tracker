import React, { Component } from 'react'

export default class Copyright extends Component {
    render() {
        return (
            <div class = "Copyright">
                <a href = "https://eric.clst.org/tech/usgeojson/">GeoJSON</a> <br />
                <a href = "https://reactjs.org">React</a> <br />
                <a href = "https://leafletjs.com">Leaflet</a> <br />
                <a href = "https://github.com/nytimes/covid-19-data/tree/master/live">Covid Data</a> <br />
                <a href = "https://covid.cdc.gov/covid-data-tracker/#county-view">Vaccination Data</a> <br />
            </div>
        )
    }
}
