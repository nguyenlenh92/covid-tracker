import React, { useEffect, useState } from 'react'
import "./RankingTable.css"
import Loading from "../Loading"
import { MDBDataTableV5 } from 'mdbreact';
import formatDate from "../../utils/utils"
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

function RankingTable(props) {
    const [data, setData] = useState()
    const [loading, setLoading] = useState(true)
    const [nameType, setNameType] = useState("state_name")
    

    useEffect(() => {
        var later = formatDate(props.date[1])
        var earlier = formatDate(props.date[0])
        var api_routes = []
        if (props.type == "country"){
            api_routes = 
            [
                fetch(`${BACKEND_URL}/api/state/cases/ranking?num=${props.number_rows}&date=${later}`),
                fetch(`${BACKEND_URL}/api/state/deaths/ranking/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/state/vaccines/ranking/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/state/population/ranking/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/state/cases/ranking?num=${props.number_rows}&date=${earlier}`)
            ]
            setNameType("state_name")
        }
        else if (props.type == "state"){
            api_routes = 
            [
                fetch(`${BACKEND_URL}/api/county/cases/ranking/${props.state_fips}/?num=${props.number_rows}&date=${later}`),
                fetch(`${BACKEND_URL}/api/county/deaths/ranking/${props.state_fips}/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/county/vaccines/ranking/${props.state_fips}/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/county/population/ranking/${props.state_fips}/${props.number_rows}`),
                fetch(`${BACKEND_URL}/api/county/cases/ranking/${props.state_fips}/?num=${props.number_rows}&date=${earlier}`)
            ]
            setNameType("county_name")
        }
        Promise.all(api_routes)
        .then(responses => {return Promise.all(responses.map((res) => {return res.json()}))})
        .then(data => {
            var states = []
            for (let i = 0; i < data[0].length; i++){
                let state = {
                    "state_name": data[0][i].state_name,
                    "county_name": data[0][i].county_name,
                    "cases": data[0][i].cases,
                    "daily_cases_per_capita": ((data[0][i].cases - data[4][i].cases) / data[3][i].population * 100000).toFixed(2),
                    "positive_case_rate": (data[0][i].cases / data[3][i].population * 100).toFixed(2).toString() + "%",
                    "deaths": data[1][i].deaths,
                    "vaccines": data[2][i].vaccines,
                    "population": data[3][i].population,
                    "vaccine_progress": (data[2][i].vaccines / data[3][i].population * 100).toFixed(2).toString() + "%"
                }
                states.push(state)
            }
            setData(states)
        })
        .catch(err => console.error(err))
        .finally(() => {
            setLoading(false)
        })
    }
    , []) 
    
    if (loading) return (
        <Loading />
    )

    return (

        <div className="d-flex justify-content-center">
            <MDBDataTableV5
                searching={true} 
                entriesOptions={[10, 25, 60]}
                entries={10}
                striped
                noRecordsFoundLabel={"No record"}
                order={['state_name', 'desc']}
                data={
                    {
                        columns: 
                        [
                            {
                                label: 'Name',
                                field: nameType,
                                width: 200,
                            },
                            {
                                label: 'Population',
                                field: 'population',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: 'Cases',
                                field: 'cases',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: 'Daily new cases per capita',
                                field: 'daily_cases_per_capita',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: "Positive Case Rate",
                                field: 'positive_case_rate',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: 'Deaths',
                                field: 'deaths',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: 'Vaccines',
                                field: 'vaccines',
                                sort: 'desc',
                                width: 500,
                            },
                            {
                                label: 'Vaccine Progress',
                                field: 'vaccine_progress',
                                sort: 'desc',
                                width: 500,
                            }
                        ],
                        rows: data
                    }
                }

            />
            {/* <Table striped bordered hover style={{textAlign: "center"}} size="sm" responsive="sm">
                <thead>
                    <tr>
                        <th>State</th>
                        {
                           props.type === "state" && <th>County</th>
                        }
                        <th>COVID Cases</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((row, index) => {
                            return( 
                                <tr key={index}>
                                    <td>{row.state_name}</td>
                                    {
                                        props.type === "state" && <td>{row.county_name}</td>
                                    }
                                    <td>{row.cases}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table> */}
        </div>
    )
}

export default RankingTable