import React, { Component } from 'react';
import {
  Toolbar, 
  Button, 
  DialogContainer,
  Divider
} from 'react-md'
import Konva from'konva'
import { 
    Stage, 
    Layer
 } from 'react-konva'
import './App.css';
import MapNavButton from './MapNavButton'
import { drawChair } from './drawChair'
import { drawWindow } from './drawWindow'
import { drawWall } from './drawWall'
import { drawDoor } from './drawDoor'
import { drawText } from './drawText'
import { drawSquare } from './drawSquare'
import { drawCircle } from './drawCircle'


class App extends Component {

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

}

showDialog = (shape) => {
    
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

  render() {

    const topButton = {
      height: "100%",
      marginTop: "0px",
      marginBottom: "0px",
    }

    const topButtonDiv = {
        textTransform: "capitalize"
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

    const mapLeftBtnProps = {
      showDialog: this.showDialog
    }
    return (
      <div>
          <Toolbar themed title="Floorplan Canvas" style={{background: "#e1e1e1"}}>
              <div style={{position:"absolute", right:0, marginLeft:20}}>
                  <Button 
                      flat
                      style={topButton}
                      onClick={() => {
                          this.setState({dialogRemoveAllElementVisible: true})
                      }}
                      >
                      <div style={topButtonDiv}>Clear</div>
                  </Button>
                  
                  <Button 
                      flat
                      style={topButton}
                      onClick={() => drawText(options)}
                      >
                      <div style={topButtonDiv}>Text</div>
                  </Button>
                  <Button 
                      flat
                      style={topButton}
                      onClick={() => drawSquare(options)}
                      >
                      <div style={topButtonDiv}>Square</div>
                  </Button>
                  <Button 
                      flat
                      style={topButton}
                      onClick={() => drawCircle(options)}
                      >
                      <div style={topButtonDiv}>Circle</div>
                  </Button>
                  <Button 
                      flat
                      style={topButton}
                      onClick={this.moveElemToBottom}
                      >
                      <div style={topButtonDiv}>To Back</div>
                  </Button>
                  <Button 
                      flat
                      style={topButton}
                      onClick={this.moveElemToFront}
                      >
                      <div style={topButtonDiv}>To Front</div>
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
        
        </div>
    )
  }
}

export default App;
