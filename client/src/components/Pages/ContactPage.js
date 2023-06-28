import React, { Component } from 'react'
import ContactForm from "../ContactForm"
import "./ContactPage.css"

export default class ContactPage extends Component {
    render() {
        return (
            <div className="content">
                <ContactForm />
            </div>
        )
    }
}
