import React, { useState } from 'react'
import { MapContainer, TileLayer} from 'react-leaflet'
import GeoJSONComponent from './GeoJSONComponent';
import "./Map.css"
import ComboBox from '../ComboBox';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
const MAPBOX_API_KEY = process.env.REACT_APP_ACCESS_TOKEN;
const MAPBOX_USERID = process.env.REACT_APP_USERNAME;
const MAPBOX_STYLEID = process.env.REACT_APP_STYLE_ID;

export default function Map(props) {
    const [colorCoding, setColorCoding] = useState(0)
    const [dateRange, setDateRange] = useState([new Date(2021, 10, 29), new Date(2021, 10, 30)]);

    const handleCallback = (childData) => {
        setColorCoding(childData)

    }


    
    return(
        <>

        <div className="map-header">
                <ComboBox className="map-header-item" title="Type" parentCallback={handleCallback} items={["COVID Cases", "Death Cases", "Vaccination Cases"]}></ComboBox>
                <DateRangePicker className="map-header-item"
                    onChange={(date) => {
                        var [earlier, later] = date
                        later.setUTCHours(-4)
                        props.dateCallBack(later)
                        setDateRange([earlier, later])
                    }}
                    value={dateRange}
                    clearIcon={null}
                />
        </div>

        <div className="map-container">



            <MapContainer center={props.center} zoom={props.zoomLevel} scrollWheelZoom={false} type={props.type} >

                <GeoJSONComponent date_range={dateRange} data={props.data} type={props.type} colorCoding={colorCoding} parentCallBack={props.parentCallBack} />
                <TileLayer
                    url={`https://api.mapbox.com/styles/v1/${MAPBOX_USERID}/${MAPBOX_STYLEID}/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`}
                />


            </MapContainer>
 
        </div>

        </>
    )
}
