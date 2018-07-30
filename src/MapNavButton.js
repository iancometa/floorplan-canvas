import React, { Component } from 'react'
import {
    Button, 
} from 'react-md'

class MapNavButton extends Component {

    render() {

        return (
            <Button
                flat
                style={{
                    width:"150px",
                    textAlign: "left",
                    textTransform: "capitalize"
                }}
                onClick={() => this.props.showDialog(this.props.buttonName)}
            >
                {this.props.buttonName}
            </Button>
        )
    }

}

export default MapNavButton
