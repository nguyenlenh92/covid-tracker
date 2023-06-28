import React, { useState, } from 'react'
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button'
import { useHistory } from 'react-router';
import "./LoginPage.css";
import { useDispatch } from 'react-redux';
import { signin } from '../../actions'


export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const history = useHistory()
    const dispatch = useDispatch()


    const submitHandler = (event) => {
      event.preventDefault()
      event.stopPropagation()
      fetch(`api/admin/login?username=${username}&password=${password}`)
      .then(res => res.json())
      .then(data => {
          if (data.success == true){
            dispatch(signin())
            history.push("/")
          }
      })
    }
    
    function isEmpty() {
      return username.length > 0 && password.length > 0;
    }

    return (
        <div className="LoginPage">
            <Form onSubmit={submitHandler}>
              
              <Form.Group size = "lg" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control autoFocus
                              type="username" 
                              value={username} 
                              placeholder="Enter Username" 
                              onChange={(e) => setUsername(e.target.value)} 
                />
              </Form.Group>
              
              <Form.Group size="lg" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" 
                              value={password} 
                              placeholder="Enter Password" 
                              onChange={(e) => setPassword(e.target.value)}
                              
                />
              </Form.Group>
              
              <Button size="xl" variant="primary" type="submit" disabled={!isEmpty}>
              Login
              </Button>
            
            </Form>
            
        </div>
    )
}
