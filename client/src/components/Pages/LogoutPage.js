import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from "react-redux"
import { signout } from '../../actions'
import Loading from '../Loading'

function LogoutPage() {
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {

        dispatch(signout())
        setTimeout(() => {
            setLoading(false)
        }, 3000);

    }, [])
    if (loading) {
        return(
        <div>
            <h1 className="d-flex justify-content-center">You are logging out...</h1> 
            <Loading />
        </div>
        )
    }

    return (
        <div>
            {history.push("/")}
        </div>
    )
}

export default LogoutPage

