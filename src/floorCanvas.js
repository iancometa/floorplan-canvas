import React, { Component } from 'react'
import {
    Toolbar, 
    Button, 
    FontIcon,
    DialogContainer,
    Divider
} from 'react-md'
import Konva from'konva'
import { 
    Stage, 
    Layer
 } from 'react-konva'
import MapNavButton from './MapNavButton'
import AddDialog from './addDialog'
import EditDialog from './editDialog'
import EditShapeDialog from './editShapeDialog'
import RemoveAllElementsDialog from './removeAllElement'
import { drawChair } from './drawChair'
import { drawWindow } from './drawWindow'
import { drawWall } from './drawWall'
import { drawDoor } from './drawDoor'
import { drawSquareTable } from './drawSquareTable'
import { drawRoundTable } from  './drawRoundTable'
import { drawText } from './drawText'
import { drawSquare } from './drawSquare'
import { drawCircle } from './drawCircle'
import { drawImage } from './drawImage'
import DeleteDialog from './deleteDialog'
import '../../styles/posLayout.css'
import DisplayMapFromDB from './displayMapFromDB'
import {UpdateRecord} from './updateFloorPlanRecord'
import {haveIntersection} from './getIntersectionMethod'
import CopyDialog from './copyDialog'
import DisplayCopiedElements from './displayCopiedElements'
import DisplayImageDialog from './displayImageDialog'
import DisplayBackgroundDialog from './displayBackgroundDialog'
import {updateFloorPlanRecord} from "../../actions/floorplansActions"
import {removeTables, createTables, updateTables} from '../../actions/tablelistActions'


class FloorCanvas extends Component {

    state = {
        dialogAddVisible: false,
        tableId: '',
        tableName: '',
        tableSeats: '',
        tableFontSize: 14,
        tableTextColor: '#000000',
        tableFontFamily: 'Helvetica',
        innerWidth: window.innerWidth - 160,
        innerHeight: window.innerHeight - 200,
        shape: '',
        gridSize: 10,
        dialogDeleteVisible: false,
        dialogEditVisible: false,
        dialogRemoveAllElementVisible: false,
        dialogEditShapeVisible: false,
        shapeNode: '',
        shapeStrokeColor: '',
        shapeStrokeWidth: '',
        shapeFillColor: '',
        shapeOpacity: '',
        alertMessage: '',
        dialogAlertVisible: false,
        selectedShapes: [],
        copySize: false,
        dialogCopyVisible: false,
        dialogImageDialogVisible: false,
        loadImageSrc: '',
        dialogBackgroundDialogVisible: false,
        loadImageType: '',
        historyLog: [],
        stageSelector: false,
        fieldOne: "Table Name",
        fieldTwo: "Table Seats",
        canvasLayer: '',
        canvasStage: ''
    }

    componentDidMount() {
        this.setState({
            canvasLayer: this.layer,
            canvasStage: this.stage
        })
        var gridSize = this.state.gridSize,
            canvasHeight = this.state.innerHeight,
            canvasWidth = this.state.innerWidth;

        /**
         * this will create grid 
         * on the stage canvas 
         */
        for (var i = 0; i <= (canvasWidth / gridSize); i++) {
            this.baseLayer.add(new Konva.Line({
                points: [i * gridSize, 0, i * gridSize, canvasHeight],
                stroke: '#fff',
                strokeWidth: 0.5
            }))
            this.baseLayer.add(new Konva.Line({
                points: [0, i * gridSize, canvasWidth, i * gridSize],
                stroke: '#fff',
                strokeWidth: 0.5
            }))
        }       

        document.addEventListener('click', this.removeContextMenu)
        this.shapeContextMenu.style.display = 'none'   
        
        /**
         * this will display the tables
         * stored from the DB
         */
        const mapProps = {
            mapLayout: this.props.mapLayout,
            layer: this.layer,
            stage: this.stage.getStage(),
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            resetTableState: this.resetTableState,
            dispatch: this.props.dispatch,
            mapId: "",
            addHistory: ""
        }
        DisplayMapFromDB(mapProps)

        this.stage.getStage().addEventListener('mousedown', this.addStageSelect)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.removeContextMenu)
        document.removeEventListener('mouseup', this.handleTextRotation)
        this.stage.getStage().removeEventListener('mousedown', this.addStageSelect)
        this.stage.getStage().removeEventListener('mouseup', this.removeStageSelect)
    }

    addStageSelect = (e) => {
        if (this.state.stageSelector) return
        /**
         * delete first the stageSelect
         * if present
         */
        this.layer.find('#stageSelect').destroy()

        const clientX = (e.clientX - 160) + 10
        const clientY = (e.clientY - 200) + 7
        
        const rect = new Konva.Rect({
            width: 1,
            height: 1,
            fill: '#ffffff',
            opacity: '0.5',
            x: clientX,
            y: clientY,
            id: "stageSelect",
        })

        this.layer.add(rect)
        this.layer.draw()

        this.stage.getStage().addEventListener('mousemove', (e) => this.scaleStageSelect(clientX, clientY, e))
        this.stage.getStage().addEventListener('mouseup', this.removeStageSelect)
    }

    scaleStageSelect = (initialX, initialY, e) => {
        const clientX = (e.clientX - 160) + 10
        const clientY = (e.clientY - 200) + 7

        const scaleWidth = clientX - initialX
        const scaleHeight = clientY - initialY
     
        this.layer.find('#stageSelect').width(scaleWidth)
        this.layer.find('#stageSelect').height(scaleHeight)
        this.layer.draw()
    }

    removeStageSelect = () => {
        if (this.state.stageSelector) return

        this.stage.getStage().removeEventListener('mousemove', this.scaleStageSelect)
        const selectedShapes = []

        for (let node of this.layer.children) {
            if (node.attrs.id === "background") continue
            const stageSelector = this.layer.find('#stageSelect')[0]
            if (stageSelector === undefined || stageSelector === "") continue
            if (node.className === "Transformer") continue
            if (node !== stageSelector) {
                if (haveIntersection(node.getClientRect(), stageSelector.getClientRect())) {
                    console.log("intersect")
                    selectedShapes.push(node)
                    
                } else {
                    console.log("not intersect")
                }
            } 
        }

        this.setState({
            selectedShapes: selectedShapes
        })

        // this.layer.find('#stageSelect').destroy()        
        this.layer.draw()

        this.stage.getStage().removeEventListener('mouseup', this.removeStageSelect)
    }

    handleTextRotation = () => {
        if (this.state.shapeNode === "") return

        this.layer.find('Transformer').destroy() 
        this.layer.draw()           
        const elem = this.state.shapeNode.getAttr('id')
        const rot = this.state.shapeNode.getAttr('rotation')
        let prevRot = this.state.shapeNode.getAttr('prevRotation')

        if (prevRot === undefined) {
            prevRot = 0
        }

        let gap = ""
        if (prevRot > rot) {
            gap = (prevRot - rot) * 1
        } else {
            gap = Math.abs(prevRot - rot) * -1
        }

        this.state.shapeNode.setAttr('prevRotation',rot)

        if (elem === "tableSquare" || elem === "tableRound") {
            this.state.shapeNode.children[1].rotate(gap)

            // check for square table
            if (this.state.shapeNode.children[0].className === "Rect") {
                const sx = this.state.shapeNode.getAttr('scaleX')
                const w = this.state.shapeNode.getAttr('width')
                const nw = sx * w
                this.state.shapeNode.setAttr('scaleX', 1)
                this.state.shapeNode.setAttr('width', nw)
                this.state.shapeNode.children[0].setAttr('width', nw)
                const tx= this.state.shapeNode.children[0].getWidth() / 2
                this.state.shapeNode.children[1].setAttr('x', tx)

                const sy = this.state.shapeNode.getAttr('scaleY')
                const y = this.state.shapeNode.getAttr('height')
                const ny = sy * y
                this.state.shapeNode.setAttr('scaleY', 1)
                this.state.shapeNode.setAttr('height', ny)
                this.state.shapeNode.children[0].setAttr('height', ny)
                const ty= this.state.shapeNode.children[0].getHeight() / 2
                this.state.shapeNode.children[1].setAttr('y', ty)
            }

            // check for round table
            if (this.state.shapeNode.children[0].className === "Ellipse") {
                const ex = this.state.shapeNode.getAttr('scaleX')
                const ey = this.state.shapeNode.getAttr('scaleY')
                const eRadius = this.state.shapeNode.getAttr('radius')
                const eRaduisX = ex * eRadius.x
                const eRadiusY = ey * eRadius.y
                this.state.shapeNode.setAttr('scaleX', 1)
                this.state.shapeNode.setAttr('scaleY', 1)
                const newRadius = {x: eRaduisX, y: eRadiusY}
                this.state.shapeNode.setAttr('radius', newRadius)
                this.state.shapeNode.children[0].setAttr('radius', newRadius)
            }
            
        } 

        this.layer.draw()
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        document.removeEventListener('mouseup', this.handleTextRotation)
        
    }

    dragElement = (e) => {
        const shapeNode = e.currentTarget
        if (this.state.stageSelector === false) this.layer.find('#stageSelect').destroy()
        const grid = this.state.gridSize
        const x = Math.floor(shapeNode.getAttr('x'))
        const y = Math.floor(shapeNode.getAttr('y'))
        shapeNode.setAttr('x', Math.round(x / grid) * grid)
        shapeNode.setAttr('y', Math.round(y / grid) * grid)
        this.layer.find('Transformer').destroy()
        this.layer.draw()
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
    }

    handleTransform = () => {
        document.addEventListener('mouseup', this.handleTextRotation)
    }

    transformSize = (e) => {  
        const shapeNode = e.currentTarget

        if (this.state.copySize === true && this.state.shapeNode !== "") {
            const nodeSX = this.state.shapeNode.getAttr('scaleX')
            const nodeSY = this.state.shapeNode.getAttr('scaleY')
            shapeNode.scaleX(nodeSX)
            shapeNode.scaleY(nodeSY)
            this.layer.find('Transformer').destroy()
            this.layer.draw()
            UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
            this.setState({copySize: false})
            return
        }
      
        const elem = shapeNode.getAttr('id')
        if (elem !== "image") {
            this.setState({
                shapeFillColor: shapeNode.children[0].attrs['fill'],
                shapeStrokeColor: shapeNode.children[0].attrs['stroke'],
                shapeStrokeWidth: shapeNode.children[0].attrs['strokeWidth'],
                shapeOpacity: shapeNode.children[0].attrs['opacity'],
                tableName: shapeNode.children[0].attrs['id'],
                tableSeats: shapeNode.children[0].attrs['seats'],
                tableFontSize: shapeNode.children[1] !== undefined ? shapeNode.children[1].attrs['fontSize'] : "",
                tableId: shapeNode.attrs['guid']
            })
        }
        this.setState({
            shapeNode: shapeNode
        })
        
        this.layer.find('Transformer').destroy()
        const tr = new Konva.Transformer()
        this.layer.add(tr)
        tr.attachTo(shapeNode)
        shapeNode.on('transform', this.handleTransform)
        this.layer.draw()
    }

    resetTableState = () => {
        this.setState({
            dialogAddVisible: false,
            tableName: '',
            tableSeats: '',
            title: '',
            shape: ''
        })
    }

    saveEntry = () => {
        if (this.state.tableName === "" || this.state.tableSeats === "") return

        const layer = this.layer.getLayer()
        const json = layer.toJSON()
        const parseJson = JSON.parse(json)
        
        if (parseJson.children.length > 0) {
            for (let elem of parseJson.children) {
                if (elem.attrs.name === this.state.tableName) {
                    this.setState({
                        dialogAlertVisible: true,
                        alertMessage: "Duplicate Entry, Please try again"
                    })
                    return
                }
            }
        }

        const options = {
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            tableName: this.state.tableName, 
            tableSeats: this.state.tableSeats,
            tableFontSize: this.state.tableFontSize, 
            tableFontFamily: this.state.tableFontFamily, 
            tableTextColor: this.state.tableTextColor, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            layer: this.layer, 
            resetTableState: this.resetTableState,
            stage: this.stage.getStage(),
            dispatch: this.props.dispatch,
            floorPlans: this.props.floorPlans,
            floorPlansFields: this.props.floorPlansFields,
            mapId: this.props.mapId,
            width: 60,
            height: 60,
            radius: {x: 30, y: 30},
            fill: '#ffffff',
            stroke: '#ffffff',
            strokeWidth: 1,
            opacity: 1,
            prevRotation: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            addHistory: this.addHistory,
            tables: this.props.tables,
            tablesFields: this.props.tablesFields,
            createdTableId: this.props.tables[0].fdGUID
        }

        switch (this.state.shape) {
            case 'Square Table':
                return drawSquareTable(options)
            case 'Round Table':
                return drawRoundTable(options)
            default:
                return
        }

    }

    updateDialogField = (field, value) => {
        switch (field) {
            case this.state.fieldOne:
                return this.setState({tableName: value})
            case this.state.fieldTwo:
                return this.setState({tableSeats: value})
            case "Table Font Size":
                return this.setState({tableFontSize: value})
            default:
                return
        }
    }

    updateEditDialogField = (field, value) => {
        switch (field) {
            case 'TableName':
                return this.setState({tableName: value})
            case 'TableSeats':
                return this.setState({tableSeats: value})
            case 'FontSize':
                return this.setState({tableFontSize: value})
            case 'shapeOpacity':  
                if (isNaN(value)) return
                return this.setState({shapeOpacity: value})
            case 'shapeStrokeWidth':
                if (value === "") {
                    this.setState({shapeStrokeWidth: parseInt(0,10)})
                } else {
                    this.setState({shapeStrokeWidth: parseInt(value,10)})
                }
                return 
            default:
                return
        }
    }

    hideDialog = () => {
        if (this.state.dialogAddVisible || this.state.dialogCopyVisible) {
            const id = this.props.tables[0].fdGUID
            const data = {
                fdGUID: id
            }
            this.props.dispatch(removeTables(data))
        }

        this.setState({
            dialogAddVisible: false,
            tableName: '',
            tableSeats: '',
            dialogDeleteVisible: false,
            dialogEditVisible: false,
            dialogRemoveAllElementVisible: false,
            dialogEditShapeVisible: false,
            shapeNode: '',
            dialogCopyVisible: false,
            dialogImageDialogVisible: false,
            loadImageSrc: '',
            dialogBackgroundDialogVisible: false
        })
    }

    showDialog = (shape) => {
        // clear the table name 
        // and table seats initially
        this.setState({
            tableName: '',
            tableSeats: ''
        })

        if (shape === "Square Table" || shape === "Round Table") {
            let data = {}
            for (let field of this.props.tablesFields) {
                switch (field.Field) {
                    case 'fdName':
                        data[field.Field] = ""
                        continue
                    case 'fdSeats':
                        data[field.Field] = 0
                        continue
                    case 'fdStatus':
                        data[field.Field] = "N"
                        continue
                    case 'fdFloorPlanID':
                        data[field.Field] = ""
                        continue
                    case 'fdNumberEating':
                        data[field.Field] = 0
                        continue
                    case 'fdOpen':
                        data[field.Field] = "N"
                        continue
                    case 'fdLimit':
                        data[field.Field] = 0.00
                        continue
                    case 'fdPrepaid':
                        data[field.Field] = 0.00
                        continue
                    default:
                        data[field.Field] = ""
                        continue
                }
            }
            
            this.props.dispatch(createTables(data))
        }
        const shapeParams = {
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            layer: this.layer,
            stage: this.stage.getStage(),
            resetTableState: this.resetTableState,
            dispatch: this.props.dispatch,
            mapId: this.props.mapId,
            addHistory: this.addHistory
        }

        switch (shape) {
            case 'Square Table':
                return this.setState({dialogAddVisible: true, shape: shape})
            case 'Round Table':
                return this.setState({dialogAddVisible: true, shape: shape})
            case 'Plant':
                return 
            case 'Chair':
                return drawChair(shapeParams) 
            case 'Door':
                return drawDoor(shapeParams) 
            case 'Wall':
                return drawWall(shapeParams)
            case 'Window':
                return drawWindow(shapeParams)  
            default:
                return
        }
    }

    editDialog = (e) => {
        this.layer.find('Transformer').destroy()
        this.layer.draw()
        this.setState({
            dialogEditVisible: true,
            tableName: this.state.shapeNode.children[1].attrs['text']
        })
    }

    editShapeDialog = (e) => {
        this.layer.find('Transformer').destroy()
        this.layer.draw()
        this.setState({
            dialogEditShapeVisible: true
        })
    }

    clickStage = (e) => {
        this.layer.find('#stageSelect').destroy()
        const selectedShapes = this.state.selectedShapes

        if (selectedShapes.length > 0) {
            this.layer.draw()
            
            for (let node of selectedShapes) {
                let tr = new Konva.Transformer()
                this.layer.add(tr)
                tr.attachTo(node)
                node.on('transform', this.handleTransform)
                this.layer.draw()
            }
            return
        }

        if (e.target.className === "Rect" || e.target.className === "Ellipse" || e.target.attrs.id === "image" || e.target.className === "Circle" || e.target.className === "Text") return
       
        this.layer.find('Transformer').destroy()
        this.layer.draw()

    }

    handleTextColourChange = (color) => {
        this.setState({
            tableTextColor: color.hex
        })
    }

    handleShapeFillChange = (color) => {
        this.setState({
            shapeFillColor: color.hex
        })
    }

    handleShapeStrokeChange = (color) => {
        this.setState({
            shapeStrokeColor: color.hex
        })
    }

    saveCanvas = () => {
        this.layer.find('Transformer').destroy()
        const layer = this.layer.getLayer()
        const json = layer.toObject()
        console.log("layer", json)
    } 

    clearCanvas = () => {    
        const group = this.layer.find('Group')    
        if (group.length === 0) return
        this.layer.find('Transformer').destroy()
        const selectedShapes = this.state.selectedShapes
        if (selectedShapes.length > 0) {
            for (let node of selectedShapes) {
                node.destroy()
                this.layer.draw()
            }
        } else {
            group.destroy()
            this.layer.draw()
        }
     
        /**
         * update fdLayout on the db
         */
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)

        this.setState({
            dialogRemoveAllElementVisible: false,
            shapeNode: '',
            shapeFillColor: '',
            shapeOpacity: '',
            shapeStrokeColor: '',
            shapeStrokeWidth: '',
            tableName: '',
            tableSeats: ''
        })
    }

    moveElemToFront = () => {
        if (this.state.shapeNode === "") return
        this.state.shapeNode.moveToTop()
        this.layer.find('Transformer').destroy()
        this.layer.draw()
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        this.setState({
            shapeNode: ''
        })
    }

    moveElemToBottom = () => {
        if (this.state.shapeNode === "") return
        this.state.shapeNode.moveToBottom()
        this.layer.find('Transformer').destroy()
        this.layer.draw()
        this.layer.find('#background').moveToBottom()
        this.layer.draw()
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        this.setState({
            shapeNode: ''
        })
    }

    editEntry = () => {
        this.state.shapeNode.setAttr('name', this.state.tableName)
        this.state.shapeNode.children[0].setAttr('id', this.state.tableName)
        this.state.shapeNode.children[0].setAttr('seats', (this.state.tableSeats))
        this.state.shapeNode.children[1].setAttr('text', this.state.tableName)
        this.state.shapeNode.children[1].setAttr('fill', this.state.tableTextColor) 
        this.state.shapeNode.children[1].setAttr('fontSize', this.state.tableFontSize)
        this.state.shapeNode.children[1].setAttr('offsetX', (this.state.shapeNode.children[1].textWidth / 2))
        this.layer.draw()

        /**
         * update fdLayout after changed
         */
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        this.props.dispatch(updateTables(this.state.tableId, "fdName", this.state.tableName, ""))
        this.props.dispatch(updateTables(this.state.tableId, "fdSeats", parseInt(this.state.tableSeats,10), ""))
        
        this.setState({
            dialogEditVisible: false,
            tableName: '',
            tableFontSize: 14,
            tableSeats: '',
            shapeNode: ''
        })
    }

    editShapeEntry = () => {
        this.state.shapeNode.children[0].setAttr('fill', this.state.shapeFillColor) 
        this.state.shapeNode.children[0].setAttr('stroke', this.state.shapeStrokeColor)
        this.state.shapeNode.children[0].setAttr('strokeWidth', this.state.shapeStrokeWidth)
        this.state.shapeNode.children[0].setAttr('opacity', this.state.shapeOpacity)
        this.layer.draw()

        /**
         * update fdLayout on the db
         */
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)

        this.setState({
            dialogEditShapeVisible: false,
            shapeFillColor: '',
            shapeStrokeColor: '',
            shapeStrokeWidth: '',
            shapeOpacity: '',
            shapeNode: ''
        })
    }

    showEditDialog = () => {
        const shapeNode = this.state.shapeNode
        const id = shapeNode.attrs['id']
        if (id === "tableSquare" || id === "tableRound") {
            this.setState({dialogEditVisible:true})
        } else {
            this.setState({dialogEditShapeVisible:true})
        }
    }

    showDeleteDialog = () => {
        this.setState({
            dialogDeleteVisible: true
        })
    }

    showCopyDialog = () => {
        let data = {}
        for (let field of this.props.tablesFields) {
            switch (field.Field) {
                case 'fdName':
                    data[field.Field] = ""
                    continue
                case 'fdSeats':
                    data[field.Field] = 0
                    continue
                case 'fdStatus':
                    data[field.Field] = "N"
                    continue
                case 'fdFloorPlanID':
                    data[field.Field] = ""
                    continue
                case 'fdNumberEating':
                    data[field.Field] = 0
                    continue
                case 'fdOpen':
                    data[field.Field] = "N"
                    continue
                case 'fdLimit':
                    data[field.Field] = 0.00
                    continue
                case 'fdPrepaid':
                    data[field.Field] = 0.00
                    continue
                default:
                    data[field.Field] = ""
                    continue
            }
        }
        
        this.props.dispatch(createTables(data))

        this.setState({
            dialogCopyVisible: true
        })
    }

    showContextMenu = () => {
        const returnDiv = <div>
                            <div className="contextMenu--option" onClick={this.showEditDialog}>Edit</div>
                            <div className="contextMenu--option" onClick={this.showDeleteDialog}>Delete</div>
                            <div className="contextMenu--option" onClick={this.showCopyDialog}>Copy</div>
                        </div>
        
        return returnDiv
    }

    handleContextMenu = (event) => {
        this.removeStageSelect()
        this.transformSize(event)

        this.layer.find('Transformer').destroy()
        this.layer.draw()

        this.shapeContextMenu.style.display = 'block'
    
        const clickX = event.evt['clientX']
        const clickY = event.evt['clientY']
        const screenW = this.state.innerWidth
        const screenH = this.state.innerHeight
        const rootW = this.shapeContextMenu.offsetWidth
        const rootH = this.shapeContextMenu.offsetHeight      
        
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const top = (screenH - clickY) > rootH;
        const bottom = !top;
        
        if (right) {
            this.shapeContextMenu.style.left = `${clickX}px`;
        }
        
        if (left) {
            this.shapeContextMenu.style.left = `${clickX - rootW}px`;
        }
        
        if (top) {
            this.shapeContextMenu.style.top = `${clickY}px`;
        }
        
        if (bottom) {
            this.shapeContextMenu.style.top = `${clickY - rootH}px`;
        }

    }

    removeContextMenu = (event) => {
        const wasOutside = !(event.target.contains === this.shapeContextMenu)
        if (wasOutside) this.shapeContextMenu.style.display = 'none'
    }

    deleteEntry = () => {
        if (this.state.shapeNode.attrs.id === "tableSquare" || this.state.shapeNode.attrs.id === "tableRound") {
            const data = {
                fdGUID: this.state.tableId
            }
            this.props.dispatch(removeTables(data))
        }

        this.state.shapeNode.destroy()
        this.layer.find('Transformer').destroy()
        this.layer.draw()

        /**
         * update fdLayout on the db
         */
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        this.hideDialog()
    }

    copyEntry = () => {
        const node = this.state.shapeNode.toObject()

        if (node.attrs.id === "tableSquare" || node.attrs.id === " tableRound") {
            const layer = this.layer.getLayer()
            const json = layer.toJSON()
            const parseJson = JSON.parse(json)
            const tableNameArray = []
            if (parseJson.children.length > 0) {
                for (let elem of parseJson.children) {
                    if (elem.attrs.id === "tableSquare" || elem.attrs.id === "tableRound") {
                        let n = parseInt(elem.attrs.name,10)
                        tableNameArray.push(n)
                    }
                    
                }
            }

            /**
             * this will find the 
             * next available table number
             */
            let result = true
            let cnt = 1
            for (cnt; cnt < (tableNameArray.length+1); cnt++) {
                result = tableNameArray.includes(cnt)
                if (!result) {
                    node.attrs.name = cnt.toString()
                    node.children[0].attrs.id = cnt.toString()
                    node.children[1].attrs.text = cnt.toString()
                    break
                }
            }
        
            if (result) {
                node.attrs.name = cnt.toString()
                node.children[0].attrs.id = cnt.toString()
                node.children[1].attrs.text = cnt.toString()
            }
        }

        const mapProps = {
            node: node,
            layer: this.layer,
            stage: this.stage.getStage(),
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            resetTableState: this.resetTableState,
            dispatch: this.props.dispatch,
            mapId: this.props.mapId,
            addHistory: this.addHistory,
            createdTableId: this.props.tables[0].fdGUID
        }
        DisplayCopiedElements(mapProps)

        this.setState({dialogCopyVisible: false})
    }

    hideAlertDialog = () => {
        this.setState({dialogAlertVisible: false})
    }

    loadImage = () => {

        if (this.state.loadImageType === "background") {
            this.layer.find('#background').destroy()
            this.layer.draw()
            UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, "")
        } 

        const options = {
            layer: this.layer,
            mapId: this.props.mapId,
            dispatch: this.props.dispatch,
            loadImageSrc: this.state.loadImageSrc,
            x: 0,
            y: 0,
            prevRotation: 0,
            rotation: 0, 
            scaleX: 1, 
            scaleY: 1,
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            resetTableState: this.resetTableState,
            id: this.state.loadImageType,
            addHistory: this.addHistory
        }
        
        drawImage(options)
        this.setState({
            dialogImageDialogVisible: false,
            dialogBackgroundDialogVisible: false
        })
    }

    getLoadImage = (type, img) => {
        switch (type) {
            case 'background': 
                return this.setState({loadImageType: type, loadImageSrc: img})
            case 'image':
                return this.setState({loadImageType: type, loadImageSrc: img})
            default:
                return
        }
    }

    removeBackground = () => {
        const bg = this.layer.find('#background')
        if (bg.length === 0) return
        bg.destroy()
        this.layer.draw()
        UpdateRecord(this.layer, this.props.mapId, this.props.dispatch, this.addHistory)
        this.hideDialog()
    }

    undoMethod = () => {
        const history = this.state.historyLog
        if (history.length === 0) return
        const lastItem = history[history.length - 1]
        if (lastItem.children.length > 0) {
            if (lastItem.children[0].attrs.id === "background") {
                this.layer.find('#background').destroy()
            }
        }
        
        this.layer.find('Group').destroy()
        this.layer.draw()

        history.pop()
        if (history.length === 0) {
            this.setState({
                historyLog: history
            })
            const myLayer = this.layer.getLayer()
            const myJson = myLayer.toJSON()
            const encodeBlank = encodeURI(myJson)
            this.props.dispatch(updateFloorPlanRecord(this.props.mapId, "fdLayout", encodeBlank, ""))
            return
        }
        if (lastItem.children.length === 0) return
        const json = JSON.stringify(history[history.length - 1])
        const encodeJson = encodeURI(json)
    
        const mapProps = {
            mapLayout: encodeJson,
            layer: this.layer,
            stage: this.stage.getStage(),
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu, 
            resetTableState: this.resetTableState,
            dispatch: this.props.dispatch,
            mapId: this.props.mapId,
            addHistory: ""
        }
        DisplayMapFromDB(mapProps)
        this.setState({
            historyLog: history
        })
    }

    addHistory = (value) => {
        const history = this.state.historyLog
        history.push(value)
        this.setState({
            historyLog: history
        })
    }

    render() {
        const context = this.showContextMenu()
        const mapLeftBtnProps = {
            showDialog: this.showDialog
        }

        const addDialogProps = {
            title: `Add ${this.state.shape}`,
            dialogAddVisible: this.state.dialogAddVisible,
            hideDialog: this.hideDialog,
            updateDialogField: this.updateDialogField,
            saveEntry: this.saveEntry,
            fieldOneValue: this.state.tableName,
            fieldTwoValue: this.state.tableSeats,
            field3Value: this.state.tableFontSize,
            fieldOne: this.state.fieldOne,
            fieldTwo: this.state.fieldTwo,
            field3: "Table Font Size"
        }

        const editDialogProps = {
            title: "Edit Table",
            dialogEditVisible: this.state.dialogEditVisible,
            hideDialog: this.hideDialog,
            updateEditDialogField: this.updateEditDialogField,
            tableTextColor: this.state.tableTextColor,
            handleTextColourChange: this.handleTextColourChange,
            tableName: this.state.tableName,
            tableFontSize: this.state.tableFontSize,
            editEntry: this.editEntry,
            shapeNode: this.state.shapeNode,
            layer: this.layer,
            tableSeats: this.state.tableSeats
        }

        const editShapeDialogProps = {
            title: "Edit Shape",
            dialogEditShapeVisible: this.state.dialogEditShapeVisible,
            hideDialog: this.hideDialog,
            shapeNode: this.state.shapeNode,
            layer: this.layer,
            shapeFillColor: this.state.shapeFillColor,
            shapeStrokeColor: this.state.shapeStrokeColor,
            shapeStrokeWidth: this.state.shapeStrokeWidth,
            shapeOpacity: this.state.shapeOpacity,
            handleShapeFillChange: this.handleShapeFillChange,
            handleShapeStrokeChange: this.handleShapeStrokeChange,
            editShapeEntry: this.editShapeEntry,
            updateEditDialogField: this.updateEditDialogField
        }

        const topButton = {
            height: "100%",
            marginTop: "0px",
            marginBottom: "0px",
        }

        const topButtonDiv = {
            textTransform: "capitalize"
        }

        const removeAllElementsDialogProps = {
            title: "Remove all elements?",
            dialogRemoveAllElementVisible: this.state.dialogRemoveAllElementVisible,
            hideDialog: this.hideDialog,
            clearCanvas: this.clearCanvas
        }
  
        const options = {
            innerWidth: this.state.innerWidth, 
            innerHeight: this.state.innerHeight, 
            transformSize: this.transformSize, 
            dragElement: this.dragElement, 
            handleContextMenu: this.handleContextMenu,
            layer: this.state.canvasLayer, 
            resetTableState: this.resetTableState,
            tableFontSize: this.state.tableFontSize,
            tableFontFamily: this.state.tableFontFamily,
            stage: this.state.canvasStage,
            dispatch: this.props.dispatch,
            mapId: this.props.mapId,
            prevRotation: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            addHistory: this.addHistory
        }

        const deleteDialogProps = {
            title: `Delete element`,
            dialogDeleteVisible: this.state.dialogDeleteVisible,
            hideDialog: this.hideDialog,
            deleteEntry: this.deleteEntry
        }

        const copyDialogProps = {
            title: `Copy element`,
            dialogCopyVisible: this.state.dialogCopyVisible,
            hideDialog: this.hideDialog,
            copyEntry: this.copyEntry,
            hasTextField: false
        }

        const imageDialogProps = {
            title: "Select Image",
            dialogImageDialogVisible: this.state.dialogImageDialogVisible,
            hideDialog: this.hideDialog,
            loadImage: this.loadImage,
            getLoadImage: this.getLoadImage
        }

        const backgroundDialogProps = {
            title: "Select Background",
            dialogBackgroundDialogVisible: this.state.dialogBackgroundDialogVisible,
            hideDialog: this.hideDialog,
            loadImage: this.loadImage,
            getLoadImage: this.getLoadImage,
            removeBackground: this.removeBackground,
            dispatch: this.props.dispatch
        }

        const alertActions = [{
            id: 'dialog-ok',
            primary: true,
            children: 'Ok',
            onClick: this.hideAlertDialog,
          }
        ]

        return (
            <div>
                <Toolbar themed style={{background: "#e1e1e1"}}>
                    <div style={{position:"absolute", right:0, marginLeft:20}}>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => {
                               this.setState({copySize: true})
                            }}
                            >
                            <FontIcon>reorder</FontIcon>
                            <div style={topButtonDiv}>Align Size</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => {
                                this.setState({dialogRemoveAllElementVisible: true})
                            }}
                            >
                            <FontIcon>clear</FontIcon>
                            <div style={topButtonDiv}>Clear</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={this.undoMethod}
                            >
                            <FontIcon>undo</FontIcon>
                            <div style={topButtonDiv}>Undo</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={this.removeBackground}
                        >
                            <FontIcon>clear</FontIcon>
                            <div style={topButtonDiv}>Delete Background</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => {
                                this.setState({dialogBackgroundDialogVisible: true})
                            }}
                            >
                            <FontIcon>photo</FontIcon>
                            <div style={topButtonDiv}>Background</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => {
                                this.setState({dialogImageDialogVisible: true})
                            }}
                            >
                            <FontIcon>photo</FontIcon>
                            <div style={topButtonDiv}>Image</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => drawText(options)}
                            >
                            <FontIcon>text_format</FontIcon>
                            <div style={topButtonDiv}>Text</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => drawSquare(options)}
                            >
                            <FontIcon>crop_square</FontIcon>
                            <div style={topButtonDiv}>Square</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={() => drawCircle(options)}
                            >
                            <FontIcon>fiber_manual_record</FontIcon>
                            <div style={topButtonDiv}>Circle</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={this.moveElemToBottom}
                            >
                            <FontIcon>file_download</FontIcon>
                            <div style={topButtonDiv}>To Back</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={this.moveElemToFront}
                            >
                            <FontIcon>file_upload</FontIcon>
                            <div style={topButtonDiv}>To Front</div>
                        </Button>
                        <Button 
                            flat
                            style={topButton}
                            onClick={this.props.backPage}
                        >
                            <FontIcon>keyboard_arrow_left</FontIcon>
                            <div style={topButtonDiv}>Back</div>
                        </Button>
                    </div>
                </Toolbar>

                <div id="container"></div>

                <div style={{display: "flex"}}>
                    <div style={{width:160}}>
                        <h2 style={{padding: "15px 16px 0px"}}>{this.props.mapName}</h2>
                        <Divider />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Window" />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Wall" />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Door" />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Chair" />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Square Table" />
                        <MapNavButton {...mapLeftBtnProps} buttonName="Round Table" />
                    </div>
                    <Stage 
                        width={this.state.innerWidth} 
                        height={this.state.innerHeight}
                        name="stage"
                        style={{
                            backgroundColor: "#696767"
                        }}
                        ref={node => {
                            this.stage = node
                        }}
                        onClick={this.clickStage}
                    >
                        <Layer
                            ref={node => {
                                this.baseLayer = node
                            }}
                        >
                        </Layer>
                        <Layer
                            ref={node => {
                                this.layer = node
                            }}
                        >
                        </Layer>
                    </Stage>
                </div>
                
                <AddDialog {...addDialogProps} />
                <EditDialog {...editDialogProps} />
                <EditShapeDialog {...editShapeDialogProps} />
                <RemoveAllElementsDialog {...removeAllElementsDialogProps} />
                <DeleteDialog {...deleteDialogProps} />
                <CopyDialog {...copyDialogProps} />
                <DisplayImageDialog {...imageDialogProps} />
                <DisplayBackgroundDialog {...backgroundDialogProps} />

                 <div ref={ref => {this.shapeContextMenu = ref}} className="contextMenu">
                    {context}
                </div>

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

export default FloorCanvas