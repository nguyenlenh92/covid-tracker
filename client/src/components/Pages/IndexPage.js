import React, { useState } from 'react'
import MapComponent from "../Map/MapComponent"
import RankingTable from "../RankingTable/RankingTable"


// [37.8, -96]
export default function IndexPage(props) {
    const [type, setType] = useState("country")
    const [currentDate, setCurrentDate] = useState(new Date(2021, 10, 30))
    const [date, setDate] = useState([new Date(2021, 10, 29), new Date(2021, 10, 30)]) 

    const dateCallBack = (date) => {
        setCurrentDate(date)
    }
    return (
        <div>
            <MapComponent 
                center={[37.8, -96]} 
                data={props.geoJSON} 
                zoomLevel={4}
                type="country"
                dateCallBack={dateCallBack}
            />
            
            <div className="ranking-table">
                <RankingTable type={type} number_rows={60} date={date}/>
            </div>
        </div>
    )
}
