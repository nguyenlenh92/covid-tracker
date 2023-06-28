import React, { useEffect, useState } from 'react'
import { Typeahead } from 'react-bootstrap-typeahead'
import Button from 'react-bootstrap/Button'
import { useHistory } from 'react-router-dom'
import './Searchbar.css'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import { useDispatch } from 'react-redux';
import { changeurl } from '../../actions'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

export default function Searchbar(){
    const [locations, setLocations] = useState([])
    const [singleSelection, setSingleSelection] = useState([]);
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    const dispatch = useDispatch()

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/location/`)
        .then(res => res.json())
        .then(data => setLocations(data))
        .finally(() => setLoading(false))

    }, [])


    const clickHandler = () => {
        fetch(`${BACKEND_URL}/api/location/search/${singleSelection[0]}`)
        .then(res => res.json())
        .then(data => {
           
            var state_fips = new Intl.NumberFormat('en', {minimumIntegerDigits:2}).format(data.state_fips)
            var county_fips = data.county_fips
            dispatch(changeurl(`/state?state_fips=${state_fips}&county_fips=${county_fips}`))
            history.push(`/state?state_fips=${state_fips}&county_fips=${county_fips}`)

        })
    }

    if (loading){
        return(
            
        <div className="search-container">
            <div className="search-bar">
                <Typeahead
                    id="placeholder-searchbox"
                    options={[]}
                    placeholder="Choose a county..."
                />
            </div>
            <Button onClick={clickHandler} variant="outline-success">Search</Button>
        </div>             
        )
    }
    return (
        <div className="search-container">
            <div className="search-bar">
                <Typeahead
                    clearButton
                    id="selections"
                    defaultSelected={locations.slice(0, 1)}
                    labelKey="state_name"
                    options={locations}
                    onChange={setSingleSelection}
                    selected={singleSelection}
                    placeholder="Choose a county..."
                />

            </div>
            <Button onClick={clickHandler} variant="outline-success">Search</Button>
        </div>
    )
}
