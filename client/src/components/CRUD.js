import React from 'react'
import { Button } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

export default function CRUD() {

    const history = useHistory()

    const redirect = (type) => {
        history.push(`/crud/${type}`)
    }

    return (
        <div>
            <div className="d-flex justify-content-center">
                <h1>Admin Panel</h1>
            </div>
            <br/>
            <div className="d-flex justify-content-center gap-5">

                <Button key={1} onClick={() => redirect("cases")}>View Cases</Button>
                <Button key={2} onClick={() => redirect("deaths")}>View Deaths</Button>
                <Button key={3} onClick={() => redirect("vaccines")}>View Vaccines</Button>
            </div>
        </div>
    )
}
