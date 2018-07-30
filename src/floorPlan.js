import React, {Component} from 'react'
import {connect} from 'react-redux'
import { 
    Toolbar, 
    List, 
    ListItem,
    FontIcon
} from 'react-md'
import Designs from './designs'
import Deploy from './deploy'
import {fetchFloorPlan} from '../../actions/floorplansActions'
import {fetchLocation} from '../../actions/locationsActions'
import {fetchLocationLayout} from '../../actions/locationslayoutActions'
import {fetchTables} from '../../actions/tablelistActions'

const navItems = [{
    primaryText:"Designs"
}, {
    primaryText:"Deploy"
}]

class FloorPlan extends Component {

    state = {
        page: 'Designs',
        displayPlan: 'block',
        plans: ''
    }

    componentDidMount() {

        const { dispatch } = this.props
        dispatch(fetchFloorPlan())
        dispatch(fetchLocation())
        dispatch(fetchLocationLayout())
        dispatch(fetchTables())
        
    }

    setPage = (page) => {
        if (this.props.locations !== undefined) {
            this.setState({page})
        }
    }

    displayPlan = (status) => {
        this.setState({
            displayPlan: status
        })
    }

    displayNavItems = () => {
        if (this.props.floorPlans === undefined || this.props.floorPlans === "") return
        const list = <List 
                        style={{
                            height:"100%",
                            width: "140px",
                            maxWidth: "140px",
                            backgroundColor: "transparent",
                            display: this.state.displayPlan
                        }}
                    >
                        {navItems.map(props => <ListItem 
                                                    leftAvatar={<FontIcon style={{marginTop:"10px"}}>keyboard_arrow_right</FontIcon>}
                                                    primaryText={props.primaryText} 
                                                    key={props.primaryText} 
                                                    onClick={() => this.setPage(props.primaryText.replace(' ',''))}
                                                />)}
                    </List>
        return list
    }

    render() {
        const displayNavItems = this.displayNavItems()
        const toolbarTitle = "Floor Plan"

        const floorPlansProps = {
            floorPlans: this.props.floorPlans,
            floorPlansFields: this.props.floorPlansFields,
            dispatch: this.props.dispatch,
            locations: this.props.locations,
            locationsFields: this.props.locationsFields,
            displayPlan: this.displayPlan,
            plans: this.state.plans,
            locationLayouts: this.props.locationLayouts,
            locationLayoutsFields: this.props.locationLayoutsFields,
            tables: this.props.tables,
            tablesFields: this.props.tablesFields
        }

        return (
            <div>
                <Toolbar 
                    colored 
                    title={toolbarTitle}
                >
                </Toolbar>

                <div style={{display:"flex"}}>
                    {displayNavItems}
                    <div style={{width: "100%"}}>
                        {(function(state) {
                            switch(state.page) {
                                case 'Deploy':
                                    return <Deploy {...floorPlansProps} />
                                    
                                case 'Designs':
                                default:
                                    return <Designs {...floorPlansProps} />
                            }
                        })(this.state)}
                    </div>
                   
                </div>
            </div>
        )
    }

}

const mapStateToProps = (state) => ({
    floorPlans: state.floorPlans.items,
    floorPlansFields: state.floorPlans.fields,
    locations: state.locations.items,
    locationsFields: state.locations.fields,
    locationLayouts: state.locationLayouts.items,
    locationLayoutsFields: state.locationLayouts.fields,
    tables: state.tables.items,
    tablesFields: state.tables.fields
});

// connect our component to the redux store
export default connect(mapStateToProps)(FloorPlan);
