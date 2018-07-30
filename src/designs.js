import React, {Component} from 'react'
import {
    Toolbar, 
    Button, 
    List, 
    ListItem,
    DialogContainer,
    Divider
} from 'react-md'
import FloorCanvas from './floorCanvas'
import AddDialog from './addDialog'
import { 
    createFloorPlanRecord,
    removeFloorPlanRecord,
    updateFloorPlanRecord
} from '../../actions/floorplansActions'
import DeleteDialog from './deleteDialog'
import CopyDialog from './copyDialog'

class Designs extends Component {

    state = {
        page: '',
        mapName: '',
        mapPrefix: '',
        mapId: '',
        dialogAddVisible: false,
        name: '',
        prefix: '',
        alertMessage: '',
        dialogAlertVisible: false,
        innerWidth: window.innerWidth - 160,
        innerHeight: window.innerHeight - 200,
        dialogDeleteVisible: false,
        dialogCopyVisible: false,
        mapLayout: '',
        dialogEditVisible: false,
        saveEntry: false,
        fieldOne: "name",
        fieldTwo: "prefix"
    }

    componentDidMount() {
        this.plansContextMenu.style.display = 'none'
        document.addEventListener('click', this.removeContextMenu)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.removeContextMenu)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.floorPlans !== this.props.floorPlans) {
            if (this.state.saveEntry) {
                const guid = this.props.floorPlans[0].fdGUID
                this.props.dispatch(updateFloorPlanRecord(guid, "fdName", this.state.name, ""))
                this.props.dispatch(updateFloorPlanRecord(guid, "fdPrefix", this.state.prefix, ""))
                this.setState({
                    saveEntry: false
                })
            }
        }
    }

    removeContextMenu = (event) => {
        const wasOutside = !(event.target.contains === this.plansContextMenu);
        if (wasOutside) this.plansContextMenu.style.display = 'none'
    }

    saveEntry = () => {
        if (this.state.name === "") {
            this.setState({dialogAlertVisible: true, alertMessage: "Fill in the name"})
            return
        }

        for (let plan of this.props.floorPlans) {
            if (plan.fdName === this.state.name) {
                this.setState({dialogAlertVisible: true, alertMessage: "Duplicate entry name, please try again"})
                return
            }
        }
    
        if (this.state.dialogAddVisible) {
            let data = {}
            for (let field of this.props.floorPlansFields) {
                
                switch (field.Field) {
                    case 'fdName':
                        data[field.Field] = this.state.name
                        continue
                    case 'fdPrefix':
                        data[field.Field] = this.state.prefix
                        continue
                    default:
                        data[field.Field] = ""
                        continue
                }

            }
            this.props.dispatch(createFloorPlanRecord(data))
            this.setState({
                dialogAddVisible: false,
                saveEntry: true
            })
        }
        
        if (this.state.dialogEditVisible) {
            this.props.dispatch(updateFloorPlanRecord(this.state.mapId, "fdName", this.state.name, ""))
            this.props.dispatch(updateFloorPlanRecord(this.state.mapId, "fdPrefix", this.state.prefix, ""))
            this.setState({
                dialogEditVisible: false
            })
        }

        
    }

    updateDialogField = (field, value) => {
        switch (field) {
            case this.state.fieldOne:
                return this.setState({name: value})
            case this.state.fieldTwo:
                return this.setState({prefix: value})
            default:
                return
        }
    }

    hideDialog = () => {
        this.setState({
            dialogEditVisible: false,
            dialogAddVisible: false,
            dialogCopyVisible: false,
            dialogDeleteVisible: false,
            name: '',
            prefix: ''
        })
    }

    showMap = (mapId, mapName, prefix, mapLayout) => {
        this.setState({
            page: 'FloorCanvas',
            mapName: mapName,
            mapPrefix: prefix,
            mapId: mapId,
            mapLayout: mapLayout
        })
        
        this.props.displayPlan('none')
    }

    backPage = () => {
        this.setState({
            page: ''
        })

        this.props.displayPlan('block')
    }

    getFloorPlans = () => {
        if (this.props.floorPlans === undefined || this.props.floorPlans === "") return

        let floorPlans = []
        for (let props of this.props.floorPlans) {
            const name = props.fdName === undefined ? this.state.name : props.fdName
            const prefix  = props.fdPrefix === undefined ? this.state.prefix : props.fdPrefix
            const layout = props.fdLayout === undefined ? "" : props.fdLayout
            floorPlans.push(<ListItem
                                primaryText={name}
                                key={props.fdGUID}
                                onClick={() => this.showMap(props.fdGUID, name, prefix, layout)} 
                                onContextMenu={(e) => this.handleContextMenu(props.fdGUID, name, prefix, e)}
                            />)

        }
        
        return <List>{floorPlans}</List>

    }

    hideAlertDialog = () => {
        this.setState({dialogAlertVisible: false})
    }

    showDialog = (dialog) => {
        switch (dialog) {
            case "edit":
                return this.setState({dialogEditVisible: true, name: this.state.mapName, prefix: this.state.mapPrefix})
            case "add":
                return this.setState({dialogAddVisible: true})
            case "delete":
                return this.setState({dialogDeleteVisible: true})
            case "copy":
                return this.setState({dialogCopyVisible: true})
            default:
                return
        }
    }

    showContextMenu = () => {
        const returnDiv = <div>
                            <div className="contextMenu--option" onClick={() => this.showDialog('edit')}>{`Edit ${this.state.mapName}`}</div>
                            <div className="contextMenu--option" onClick={() => this.showDialog('delete')}>{`Delete ${this.state.mapName}`}</div>
                            <div className="contextMenu--option" onClick={() => this.showDialog('copy')}>{`Copy ${this.state.mapName}`}</div>
                        </div>
        
        return returnDiv
    }

    handleContextMenu = (id, map, prefix, event) => {
        
        this.setState({
            mapId: id,
            mapName: map,
            mapPrefix: prefix
        })

        this.plansContextMenu.style.display = 'block'

        const clickX = event.clientX
        const clickY = event.clientY
        const screenW = this.state.innerWidth
        const screenH = this.state.innerHeight
        const rootW = this.plansContextMenu.offsetWidth
        const rootH = this.plansContextMenu.offsetHeight      
        
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const top = (screenH - clickY) > rootH;
        const bottom = !top;
        
        if (right) {
            this.plansContextMenu.style.left = `${clickX}px`;
        }
        
        if (left) {
            this.plansContextMenu.style.left = `${clickX - rootW}px`;
        }
        
        if (top) {
            this.plansContextMenu.style.top = `${clickY}px`;
        }
        
        if (bottom) {
            this.plansContextMenu.style.top = `${clickY - rootH}px`;
        }

    }

    deleteEntry = () => {

        for (let item of this.props.locationLayouts) {
            if (item.fdLayoutID === this.state.mapId) {
                this.setState({dialogAlertVisible: true, alertMessage: "Floor Plan in use. Remove it on Deploy section first"})
                return
            }
        }

        const data = {
            fdGUID: this.state.mapId
        }

        this.props.dispatch(removeFloorPlanRecord(data))

        this.setState({
            mapId: '',
            mapName: '',
            dialogDeleteVisible: false
        })
    }

    copyEntry = () => {

        if (this.state.name === "") {
            this.setState({dialogAlertVisible: true, alertMessage: "Fill in the name"})
            return
        }

        for (let plan of this.props.floorPlans) {
            if (plan.fdName === this.state.name) {
                this.setState({dialogAlertVisible: true, alertMessage: "Duplicate entry name, please try again"})
                return
            }
        }

        let fdLayout = ""
        for (let map of this.props.floorPlans) {
            if (map.fdGUID === this.state.mapId) {
                fdLayout = map.fdLayout
                break
            }
        }

        let data = {}
        
        for (let field of this.props.floorPlansFields) {
            
            switch (field.Field) {
                case 'fdName':
                    data[field.Field] = this.state.name
                    continue
                case 'fdPrefix':
                    data[field.Field] = this.state.prefix
                    continue
                case 'fdLayout':
                    data[field.Field] = fdLayout
                    continue
                default:
                    data[field.Field] = ""
                    continue
            }
        }
        
        /*
        * add the new menu item to the db
        */
        this.props.dispatch(createFloorPlanRecord(data))

        this.setState({
            dialogCopyVisible: false,
            saveEntry: true
        })
    }
    
    render() {
        
        const floorCanvasProps = {
            backPage: this.backPage,
            mapName: this.state.mapName,
            mapId: this.state.mapId,
            dispatch: this.props.dispatch,
            floorPlans: this.props.floorPlans,
            floorPlansFields: this.props.floorPlansFields,
            mapLayout: this.state.mapLayout,
            tables: this.props.tables,
            tablesFields: this.props.tablesFields
        }

        const addDialogProps = {
            title: this.state.dialogEditVisible ? "Edit " + this.state.mapName : "Add Floor Plan",
            dialogAddVisible: this.state.dialogAddVisible ? this.state.dialogAddVisible : this.state.dialogEditVisible,
            showDialog: this.showDialog,
            hideDialog: this.hideDialog,
            fieldOneValue: this.state.name,
            fieldTwoValue: this.state.prefix,
            fieldOne: this.state.fieldOne,
            fieldTwo: this.state.fieldTwo,
            updateDialogField: this.updateDialogField,
            saveEntry: this.saveEntry
        }

        const alertActions = [{
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.hideAlertDialog,
          }
        ]

        const deleteDialogProps = {
            title: `Delete ${this.state.mapName}`,
            dialogDeleteVisible: this.state.dialogDeleteVisible,
            hideDialog: this.hideDialog,
            deleteEntry: this.deleteEntry
        }

        const copyDialogProps = {
            title: `Copy ${this.state.mapName}`,
            dialogCopyVisible: this.state.dialogCopyVisible,
            hideDialog: this.hideDialog,
            copyEntry: this.copyEntry,
            hasTextField: true,
            name: this.state.name,
            updateDialogField: this.updateDialogField
        }

        const floorPlans = this.getFloorPlans()
        const showListMap = <div>
                                <Toolbar themed title="Plans">
                                    <div style={{position:"absolute", right:0, marginRight:20}}>
                                        <Button 
                                            className="gapped" 
                                            raised 
                                            secondary 
                                            style={{textTransform: "capitalize"}}
                                            onClick={() => this.showDialog('add')}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </Toolbar>
                                {floorPlans}
                            </div>

        const context = this.showContextMenu()

        return (
            <div>
                {(function(state) {
                    switch(state.page) {
                        case 'FloorCanvas':
                            return <FloorCanvas {...floorCanvasProps} />
                            
                        case '':
                        default:
                            return showListMap
                    }
                })(this.state)}

                <div ref={ref => {this.plansContextMenu = ref}} className="contextMenu">
                    {context}
                </div>

                <AddDialog {...addDialogProps}/>
                <DeleteDialog {...deleteDialogProps} />
                <CopyDialog {...copyDialogProps} />

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

export default Designs