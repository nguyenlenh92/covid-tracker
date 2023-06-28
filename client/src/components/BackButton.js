import React from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { useHistory } from 'react-router';

export default function BackButton() {
    var history = useHistory()

    const redirectBack = () => {
        history.push("/")
    }

    return (
        <div>
            <button onClick={redirectBack} style={{backgroundColor: "white", border: "none"}}><BiArrowBack size={60} /></button>
        </div>
    )
}
