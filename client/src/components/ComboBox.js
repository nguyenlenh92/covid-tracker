import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export default function ComboBox(props) {
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <>
            <DropdownButton key={currentIndex} as={ButtonGroup} title={props.items[currentIndex]} >
                {
                    props.items.map((value, index) => {
                        return(
                            <Dropdown.Item 
                            eventKey={index} 
                            key={index} 
                            onClick={(event) => {
                                setCurrentIndex(index)
                                props.parentCallback(index)
                                event.preventDefault();
                            }}>
                                {value}
                            </Dropdown.Item>
                        )
                    })
                }

            </DropdownButton>
        </>
    )
}