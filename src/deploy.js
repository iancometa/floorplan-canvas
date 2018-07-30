import React, {Component} from 'react'
import {
    Toolbar, 
    List, 
    ListItem,
    FontIcon,
    DialogContainer,
    Divider,
    SelectionControlGroup
} from 'react-md'
import { 
    createLocationLayoutRecord,
    removeLocationLayoutRecord,
    updateLocationLayoutRecord
} from "../../actions/locationslayoutActions"

class Deploy extends Component {

    state = {
        locationId: '',
        innerWidth: window.innerWidth - 160,
        innerHeight: window.innerHeight - 200,
        locationName: '',
        dialogAddVisible: false,
        dialogTitle: '',
        floorPlanId: '',
        dialogAlertVisible: false,
        alertMessage: '',
        floorPlanName: '',
        dialogDeleteVisible: false,
        locationLayoutId: '',
        locationLayoutName: '', 
        saveEntry: false
    }

    componentDidMount() {
        this.deployContextMenu.style.display = 'none'   
        this.planContextMenu.style.display = 'none'
        
        /**
         * display the first location map
         */
        if (this.props.locations !== undefined || this.props.locations !== "") {
            const locationId = this.props.locations[0].fdGUID
            const locationName = this.props.locations[0].fdLocationName
            this.setState({
                locationId: locationId,
                locationName: locationName
            })
        }

        /**
         * set the first floorplan 
         */
        if (this.props.floorPlans !== undefined || this.props.floorPlans !== "" || this.props.floorPlans.length !== 0) {
            const floorPlanId = this.props.floorPlans.length === 0 ? "" : this.props.floorPlans[0].fdGUID 
            const floorPlanName = this.props.floorPlans.length === 0 ? "" : this.props.floorPlans[0].fdName
            this.setState({
                floorPlanId: floorPlanId,
                floorPlanName: floorPlanName
            })
        }

        document.addEventListener('click', this.removeContextMenu)
        
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.removeContextMenu)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.locationLayouts !== this.props.locationLayouts) {
            if (this.state.saveEntry) {
                const guid = this.props.locationLayouts[0].fdGUID
                this.props.dispatch(updateLocationLayoutRecord(guid, "fdName", this.state.floorPlanName, ""))
                this.props.dispatch(updateLocationLayoutRecord(guid, "fdLocationID", this.state.locationId, ""))
                this.props.dispatch(updateLocationLayoutRecord(guid, "fdLayoutID", this.state.floorPlanId, ""))
                this.setState({
                    saveEntry: false
                })
              
            }
        }        
        
    }

    getLocationId = (e) => {
        this.setState({
            locationId: e.currentTarget.dataset.id,
            locationName: e.currentTarget.dataset.name
        })
    }

    getLocations = () => {    
        if (this.props.locations === undefined || this.props.locations === "") return
        const locations = <List style={{paddingTop: "0px", paddingBottom: "0px"}}>{this.props.locations.map(props => props.fdGUID === this.state.locationId ?                              <ListItem 
                                    primaryText={props.fdLocationName} 
                                    key={props.fdGUID} 
                                    data-id={props.fdGUID}
                                    data-name={props.fdLocationName}
                                    onClick={this.getLocationId}  
                                    onContextMenu={this.handleContextMenu}  
                                    style={{
                                        backgroundColor: "#e0e0e0"
                                    }}
                                /> : <ListItem 
                                        primaryText={props.fdLocationName} 
                                        key={props.fdGUID} 
                                        data-id={props.fdGUID}
                                        data-name={props.fdLocationName}
                                        onClick={this.getLocationId}  
                                        onContextMenu={this.handleContextMenu}  
                                        style={{
                                            backgroundColor: "#ffffff"
                                        }}
                                    />)}</List>
        return locations
    }

    getLocationsLayout = () => {    
        if (this.props.locationLayouts === undefined || this.props.locationLayouts === "") return
        const locationsLayout = <List 
                                    style={{
                                        backgroundColor: "#e0e0e0", 
                                        paddingTop: "0px", 
                                        paddingBottom: "0px"
                                    }}>{this.props.locationLayouts.map(props => props.fdLocationID === this.state.locationId? <ListItem
                                    leftAvatar={<FontIcon style={{marginTop:"10px"}}>keyboard_arrow_right</FontIcon>}
                                    primaryText={props.fdName === undefined ? this.state.floorPlanName : props.fdName} 
                                    key={props.fdGUID} 
                                    data-id={props.fdGUID}
                                    data-name={props.fdName === undefined ? this.state.floorPlanName : props.fdName} 
                                    onContextMenu={this.handlePlanContextMenu}
                                /> : '')}</List>
        return locationsLayout
    }

    selectFloorPlans = () => {    
        if (this.props.floorPlans === undefined || this.props.floorPlans === "") return

        const controls = this.props.floorPlans.map(props => ({
            label: props.fdName,
            value: props.fdGUID,
            name: props.fdName,
            onChange: this.handleFloorPlanOnChange
        }))
        
        const floorPlans = <SelectionControlGroup
                                id="custom-controls"
                                name="custom-controls"
                                type="radio"
                                controls={controls}
                            />
        
        return floorPlans
    }

    handleFloorPlanOnChange = (planId, event) => {
        this.setState({floorPlanId: planId, floorPlanName: event.target.name})
    }

    handlePlanContextMenu = (event) => {
        this.setState({
            locationLayoutId: event.currentTarget.dataset.id,
            locationLayoutName: event.currentTarget.dataset.name
        })
        this.deployContextMenu.style.display = 'none'
        this.planContextMenu.style.display = 'block'

        const clickX = event.clientX
        const clickY = event.clientY
        const screenW = this.state.innerWidth
        const screenH = this.state.innerHeight
        const rootW = this.planContextMenu.offsetWidth
        const rootH = this.planContextMenu.offsetHeight      
        
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const top = (screenH - clickY) > rootH;
        const bottom = !top;
        
        if (right) {
            this.planContextMenu.style.left = `${clickX}px`;
        }
        
        if (left) {
            this.planContextMenu.style.left = `${clickX - rootW}px`;
        }
        
        if (top) {
            this.planContextMenu.style.top = `${clickY}px`;
        }
        
        if (bottom) {
            this.planContextMenu.style.top = `${clickY - rootH}px`;
        }

    }

    handleContextMenu = (event) => {
        
        this.setState({
            locationId: event.currentTarget.dataset.id,
            locationName: event.currentTarget.dataset.name
        })
        this.planContextMenu.style.display = 'none'
        this.deployContextMenu.style.display = 'block'

        const clickX = event.clientX
        const clickY = event.clientY
        const screenW = this.state.innerWidth
        const screenH = this.state.innerHeight
        const rootW = this.deployContextMenu.offsetWidth
        const rootH = this.deployContextMenu.offsetHeight      
        
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const top = (screenH - clickY) > rootH;
        const bottom = !top;
        
        if (right) {
            this.deployContextMenu.style.left = `${clickX}px`;
        }
        
        if (left) {
            this.deployContextMenu.style.left = `${clickX - rootW}px`;
        }
        
        if (top) {
            this.deployContextMenu.style.top = `${clickY}px`;
        }
        
        if (bottom) {
            this.deployContextMenu.style.top = `${clickY - rootH}px`;
        }

    }

    removeContextMenu = (event) => {
        const wasOutside = !(event.target.contains === this.deployContextMenu)
        const planOutside = !(event.target.contains === this.planContextMenu)
        if (wasOutside || planOutside) {
            this.deployContextMenu.style.display = 'none'
            this.planContextMenu.style.display = 'none'
        }
    }

    showDialog = (status) => {
        switch (status) {
            case 'add':
                if (this.props.floorPlans.length === 0) return this.setState({dialogAlertVisible: true, alertMessage: "Create a Plan first"})
                return this.setState({
                    dialogAddVisible: true, 
                    dialogTitle: 'Add Plan to '+this.state.locationName,
                    floorPlanId: this.props.floorPlans[0].fdGUID,
                    floorPlanName: this.props.floorPlans[0].fdName
                })
            case 'delete':
                return this.setState({dialogDeleteVisible: true, dialogTitle: 'Remove '+this.state.locationLayoutName+ ' on '+this.state.locationName})
            default:
                return 
        }
    }

    showContextMenu = () => {
        return <div className="contextMenu--option" onClick={() => this.showDialog('add')}>Add Plan to {this.state.locationName}</div>
    }

    showDeleteContextMenu = () => {
        return <div className="contextMenu--option" onClick={() => this.showDialog('delete')}>Delete {this.state.locationLayoutName} on {this.state.locationName}</div>
    }

    hideDialog = () => {
        this.setState({
            dialogAddVisible: false,
            dialogDeleteVisible: false
        })
    }

    saveEntry = () => {

        if (this.state.floorPlanId === "") {
            this.setState({dialogAlertVisible: true, alertMessage: "Please select a plan"})
            return
        }      

        const locationLayouts = this.props.locationLayouts
        for (let item of locationLayouts) {
            if (item.fdLayoutID === this.state.floorPlanId && item.fdLocationID === this.state.locationId) {
                this.setState({dialogAlertVisible: true, alertMessage: "Plan already existing on " + this.state.locationName})
                return
            }
        }

        let data = {}
        
        for (let field of this.props.locationLayoutsFields) {
            
            switch (field.Field) {
                case 'fdName':
                    data[field.Field] = this.state.floorPlanName
                    continue
                case 'fdLocationID':
                    data[field.Field] = this.state.locationId
                    continue
                case 'fdLayoutID':
                    data[field.Field] = this.state.floorPlanId
                    continue
                default:
                    data[field.Field] = ""
                    continue
            }

        }
        
        /*
        * add the new menu item to the db
        */
        this.props.dispatch(createLocationLayoutRecord(data))

        this.setState({
            saveEntry: true,
            dialogAddVisible: false
        })
    }

    hideAlertDialog = () => {
        this.setState({dialogAlertVisible: false})
    }

    deleteEntry = () => {
        const data = {
            fdGUID: this.state.locationLayoutId
        }

        this.props.dispatch(removeLocationLayoutRecord(data))

        this.setState({
            locationLayoutId: '',
            locationLayoutName: '',
            floorPlanId: '',
            floorPlanName: '',
            dialogDeleteVisible: false
        })
    }

    render() {

        const context = this.showContextMenu()
        const planContext = this.showDeleteContextMenu()
        const showLocations = this.getLocations()
        const showLocationsLayout = this.getLocationsLayout()
        const selectFloorPlans = this.selectFloorPlans()

        let html = document.documentElement
        let width = html.clientWidth - 140

        const actions = [{
            id: 'dialog-cancel',
            secondary: true,
            children: 'Cancel',
            onClick: this.hideDialog,
          }, {
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.saveEntry,
          }
        ]

        const alertActions = [{
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.hideAlertDialog,
          }
        ]
    
        const deleteActions = [{
            id: 'dialog-cancel',
            secondary: true,
            children: 'Cancel',
            onClick: this.hideDialog,
          }, {
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.deleteEntry,
          }
        ]

        return (
            <div style={{width:width, paddingLeft: "2px"}}>

                <div style={{display: "flex"}}>
                    <div style={{width: "100%"}}>
                        <Toolbar themed title="Locations"></Toolbar>
                        {showLocations}
                    </div>
                    <div style={{width: "300px", backgroundColor: "#e0e0e0"}}>
                        <Toolbar themed title="Plans"></Toolbar>
                        {showLocationsLayout}
                    </div>
                </div>

                <div ref={ref => {this.deployContextMenu = ref}} className="contextMenu">
                    {context}
                </div>
                <div ref={ref => {this.planContextMenu = ref}} className="contextMenu">
                    {planContext}
                </div>

                <DialogContainer
                    id="add-dialog"
                    title={this.state.dialogTitle}
                    visible={this.state.dialogAddVisible}
                    actions={actions}
                    onHide={this.hideDialog}
                    contentClassName="md-grid"
                    width={350}
                >
                    {selectFloorPlans}
                </DialogContainer>

                <DialogContainer
                    id="delete-dialog"
                    title={this.state.dialogTitle}
                    visible={this.state.dialogDeleteVisible}
                    actions={deleteActions}
                    onHide={this.hideDialog}
                    >
                    <Divider />
                </DialogContainer>

                <DialogContainer
                    id="alert-floorplan-dialog"
                    title={this.state.alertMessage}
                    visible={this.state.dialogAlertVisible}
                    actions={alertActions}
                    onHide={this.hideAlertDialog}
                >
                    <Divider />
                </DialogContainer>
                
            </div>
        )

    }
}

export default Deploy