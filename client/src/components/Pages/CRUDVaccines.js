import React from 'react'
import {Row, Col, Button, Card, Form} from 'react-bootstrap';
import { MDBDataTableV5 } from 'mdbreact';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
export default class CRUDVaccines extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            "id": "",
            "date": "",
            "county_fips": "",
            "cases": "",
            "errorMsg": ""
            };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    //input handler
    handleChange(event){
        const inputId = event.target.id;
        const inputValue= event.target.value;
        let state = this.state;
        state[inputId] = inputValue;
        this.setState(state);
    }

    //click handler
    handleClick(event) {
    const serverUrl = `${BACKEND_URL}/api/vaccines`;
        const buttonId = event.target.id;
        let state = this.state
        //Create
        if (buttonId === "create"){
            fetch(serverUrl + "/new", {
                method: 'POST',
                body: JSON.stringify({
                    "date": state["date"],
                    "county_fips": state["county_fips"],
                    "cases": state["cases"]
                    })
            })
            .then(response => {
                state["httpStatus"] = response.status;
                state["errorMsg"] = response.statusText;
                if (response.status < 300) {
                    return response.json();
                }
                return{}
            })
            .then(object => {
                if (state["httpStatus"] < 300){
                    state["id"] = object["id"];
                    state["date"] = object["date"];
                    state["county_fips"] = object["county_fips"];
                    state["cases"] = object["cases"];
                }
                else {
                    state["date"] = "";
                    state["county_fips"] = "";
                    state["cases"] = "";
                }
                this.setState(state);
            })
            .catch(error => {
                state["date"] = "";
                state["county_fips"] = "";
                state["cases"] = "";
                state["errorMsg"] = error;
                this.setState(state);
            });
        }

        //Read
        else if (buttonId === "read") {
            fetch(serverUrl + "/" + state["county_fips"], {
                method: 'GET'
            })
            .then(response => {
                state["httpStatus"] = response.status;
                state["errorMsg"] = response.statusText;
                if (response.status < 300) {
                    return response.json();
                }
                return {}
            })
            .then(object => {
                if (state["httpStatus"] < 300){
                    state["id"] = object["id"]
                    state["date"] = object["date"];
                    state["county_fips"] = object["county_fips"];
                    state["cases"] = object["cases"];
                }
                else {
                    state["date"] = "";
                    state["id"] = "";
                    state["cases"] = "";
                }
                this.setState(state);
            })
            .catch(error => {
                state["date"] = "";
                state["id"] = "";
                state["cases"] = "";
                state["errorMsg"] = error;
                this.setState(state);
            });
        }
        //Update
        else if (buttonId === "update") {
            fetch(serverUrl + "/update/" + state["id"], {
                method: 'PUT',
                body: JSON.stringify({
                    "id": state["id"],
                    "date": state["date"],
                    "county_fips": state["county_fips"],
                    "cases": state["cases"]
                })
            })
            .then(response => {
                state["httpStatus"] = response.status;
                state["errorMsg"] = response.statusText;
                if (response.status < 300) {
                    return response.json();
                }
                return {}
            })
            .then(object => {
                if (state["httpStatus"] < 300) {
                    state["id"] = object["id"]
                    state["date"] = object["date"];
                    state["county_fips"] = object["county_fips"];
                    state["cases"] = object["cases"];
                }
                this.setState(state);
            })
            .catch(error => {
                state["errorMsg"] = error;
                this.setState(state);
            }); 
        }
        //Delete
        else if(buttonId === "delete") {
            fetch(serverUrl + "/delete/" + state["id"], {
                method: 'DELETE'
            })
            .then(response => {
                state["httpStatus"] = response.status;
                state["errorMsg"] = response.statusText;
                if (response.status < 300) {
                  return response.json();
                }
                return {}
            })
            .then(object => {
                if(state["httpStatus"] < 300){
                    state["id"] = object["id"]
                    state["date"] = object["date"];
                    state["county_fips"] = object["county_fips"];
                    state["cases"] = object["cases"];
                }
                this.setState(state);
            })
            .catch(error => {
                state["errorMsg"] = error;
                this.setState(state);
            });   
        }
    }
    //Page
    render() {
        const state = this.state;
        return(
            <div className="crud stuff">
                <Row> <Col sm={{ size: 3 }}> <Card className='mt-5'>
                    <Card.Header tag="h3">API Test</Card.Header>
                    <Card.Body>
                        <Form.Group>
                            <Form.Label>ID:</Form.Label>
                            <Form.Control value={state["id"]} onChange={this.handleChange} id="id" />
                        </Form.Group> <br />
                        <Form.Group>
                            <Form.Label> Date: </Form.Label>
                            <Form.Control value={state["date"]} onChange={this.handleChange} id="date" />
                        </Form.Group> <br />
                        <Form.Group>
                            <Form.Label> County Fips: </Form.Label>
                            <Form.Control value={state["country_fips"]} onChange={this.handleChange} id="county_fips" />
                        </Form.Group> <br />
                        <Form.Group>
                            <Form.Label>Vaccines: </Form.Label>
                            <Form.Control value={state["cases"]} onChange={this.handleChange} id="cases" />
                        </Form.Group> <br />
                        <Button color="success" onClick={this.handleClick} id="create">Create</Button>{" "}
                        <Button color="primary" onClick={this.handleClick} id="read">Read</Button>{" "}
                        <Button color="warning" onClick={this.handleClick} id="update">Update</Button>{" "}
                        <Button color="danger" onClick={this.handleClick} id="delete">Delete</Button>{" "}
                    </Card.Body>
                    <Card.Footer>
                        {"Message: " + state["errorMsg"]}
                    </Card.Footer>
                </Card> </Col> </Row>

                <MDBDataTableV5
                    searching={false}
                    entries={1}
                    striped
                    noRecordsFoundLabel={"Not Found!"}
                    order={['cases', 'desc']}
                    data={
                        {
                            columns:
                                [
                                    {
                                        label: 'ID',
                                        field: 'id',
                                        width: 100,
                                    },
                                    {
                                        label: 'Date',
                                        field: 'date',
                                        width: 100,
                                    },
                                    {
                                        label: 'County Fips',
                                        field: 'county_fips',
                                        width: 100,
                                    },
                                    {
                                        label: 'cases',
                                        field: 'cases',
                                        width: 100,
                                    },
                                ],
                            rows: [
                                {
                                    id: state["id"],
                                    date: state["date"],
                                    county_fips: state["county_fips"],
                                    cases: state["cases"]
                                }
                            ]
                        }
                    }

                />
            </div>
        )
    }
}