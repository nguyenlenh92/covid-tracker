import React from "react"
import Navbar from "react-bootstrap/Navbar"
import Nav from "react-bootstrap/Nav"
import Container from "react-bootstrap/Container"
import './Header.css';
import Searchbar from "../components/Searchbar/Searchbar"
import { useSelector } from 'react-redux'

export default function Header(){
	const isLogged = useSelector(state => state.isLogged)

	return(
		<>
			<Navbar bg="dark" variant="dark" className="d-flex" expand="sm">
				<Container fluid>
					<Navbar.Collapse>

						<Navbar.Brand href="/">
							Covid Tracker
						</Navbar.Brand>

						<Nav className="me-auto">
							{ !isLogged ? <Nav.Link href="/login">Log in</Nav.Link> : <Nav.Link href="/logout">Log out</Nav.Link> }
							{ isLogged && <Nav.Link href="/crud">Admin Panel</Nav.Link> }
							<Nav.Link href="/contact">Contact</Nav.Link>
						</Nav>

						<Searchbar />

					</Navbar.Collapse>
				</Container>
			</Navbar>
		</>
	)
}
