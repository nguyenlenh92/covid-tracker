import React, { useState, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import StatePage from "../components/Pages/StatePage"
import IndexPage from "../components/Pages/IndexPage"
import Loading from "../components/Loading"
import LoginPage from "../components/Pages/LoginPage"
import CRUDCases from "../components/Pages/CRUDCases"
import CRUDVaccines from "../components/Pages/CRUDVaccines"
import CRUDDeaths from "../components/Pages/CRUDDeaths"
import LogoutPage from "../components/Pages/LogoutPage"
import CRUD from "../components/CRUD"
import ContactPage from "../components/Pages/ContactPage"
import NoPermissionPage from "../components/Pages/NoPermissionPage"
import { useSelector } from "react-redux"
const countiesData = require("../data/gz_2010_us_050_00_20m.json")
const statesData = require("../data/gz_2010_us_040_00_20m.json")  


export default function Content(){
    const [loaded, setLoading] = useState(false)
    const isLogged = useSelector(state => state.isLogged)
    const url = useSelector(state => state.isURLChanged)

    useEffect(() => {
        if (countiesData && statesData){
            setLoading(true)
        }
    }, [])


    const mountComponents = () => {
        if (loaded){
            return(
                <Switch>
                    <Route exact path="/">
                        <IndexPage geoJSON={statesData}/>
                    </Route>

                    <Route path="/state">
                        <StatePage geoJSON={countiesData} key={url} url={"http://localhost:3000" + url}/>
                    </Route>

                    <Route path="/login">
                        <LoginPage />
                    </Route>
                    
                    <Route path="/contact">
                        <ContactPage />
                    </Route>

                    <Route exact path="/crud/">
                        {isLogged ? <CRUD /> : <NoPermissionPage />}
                    </Route>

                    <Route exact path="/crud/cases">
                        {isLogged ? <CRUDCases /> : <NoPermissionPage />}
                    </Route>

                    <Route exact path="/crud/vaccines">
                        {isLogged ? <CRUDVaccines /> : <NoPermissionPage />}
                    </Route>

                    <Route exact path="/crud/deaths">
                        {isLogged ? <CRUDDeaths /> : <NoPermissionPage />}
                    </Route>
                    
                    <Route exact path="/logout">
                       <LogoutPage />
                   </Route>


                </Switch>
            )
        }
        else {
            return <Loading />
        }
    }

    return(
        <div className="content-container">
           { mountComponents() }
        </div>
    );
}