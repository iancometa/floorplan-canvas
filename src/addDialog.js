import React, {Component} from 'react'
import { 
    DialogContainer, 
    TextField
} from 'react-md'


class AddDialog extends Component {

    state = {
        focusOnMount: true,
        containFocus: true,
        initialFocus: undefined
    }

    render() {

        const {
            initialFocus,
            focusOnMount,
            containFocus
        } = this.state

        const actions = [{
            id: 'dialog-cancel',
            secondary: true,
            children: 'Cancel',
            onClick: this.props.hideDialog,
          }, {
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.props.saveEntry,
          }
        ]

        return (
            <DialogContainer
                id="add-dialog"
                title={this.props.title}
                visible={this.props.dialogAddVisible}
                actions={actions}
                onHide={this.props.hideDialog}
                initialFocus={initialFocus}
                focusOnMount={focusOnMount}
                containFocus={containFocus}
                contentClassName="md-grid"
                width={350}
            >
                <TextField 
                    id="add-field-1" 
                    label={this.props.fieldOne}                                                          
                    value={this.props.fieldOneValue}
                    required
                    onChange={(e) => {
                        this.props.updateDialogField(this.props.fieldOne, e)
                    }}
                    className="md-cell md-cell--12" 
                    errorText="This field is required."
                />
                 <TextField 
                    id="add-field-2" 
                    label={this.props.fieldTwo}                                                            
                    value={this.props.fieldTwoValue}
                    onChange={(e) => {
                        this.props.updateDialogField(this.props.fieldTwo, e)
                    }}
                    className="md-cell md-cell--12" 
                />
                <TextField 
                    id="add-field-3" 
                    label={this.props.field3}                                                            
                    value={this.props.field3Value}
                    onChange={(e) => {
                        this.props.updateDialogField(this.props.field3, e)
                    }}
                    className="md-cell md-cell--12" 
                />
            </DialogContainer>
        )
    }

}

export default AddDialog