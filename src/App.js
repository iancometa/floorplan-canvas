import React, { Component } from 'react';
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
import './App.css';
import MapNavButton from './MapNavButton'
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
