import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      selected_data:[],
      sentimentColors : { positive: "green", negative: "red", neutral: "gray" }
    };
  }
  componentDidMount(){
    this.renderChart()
  }
  componentDidUpdate(){
    this.renderChart()
}
set_data = (csv_data) => {
  this.setState({ data: csv_data });
}
renderChart=()=>{
  var margin ={left:50,right:150,top:10,bottom:10},width = 500,height=300;
  var innerWidth = width - margin.left - margin.right
  var innerHeight = height - margin.top - margin.bottom
  
}
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item"> 
          <h2>Projected Tweets</h2> 
            <svg> </svg> 
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2> 
          </div>
        </div>
      </div>
    );
  }
}

export default App;
