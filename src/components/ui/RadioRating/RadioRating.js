import React, { Component } from 'react';

import style from './RadioRating.module.css';

export default class RadioRating extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            rate: ( props.rate ? props.rate : 0 ),
            rateHover : 0
        }
    }
    
    // Callbacks
    componentDidUpdate(prevProps) {
        if (this.props.value !== prevProps.value) {
            this.setState( {
                rate: this.props.rate,
            } );
        }
      }

    // Event Handler
    handleChange = ( event ) => {
        if(this.props.onChange)  this.props.onChange( event );

        this.setState( {
            rate: event.target.value
        } );
    }

    handleMouseEnter = ( index ) => {
        this.setState( {
            rateHover: index
        } );
    }
    
    handleMouseLeave = () => {
        this.setState( {
            rateHover: 0
        } );
    }
    
    // Renderer
    render() {
        
        const totalDefault = 5;
        const total = this.props.total ? this.props.total : totalDefault;
        const items = [];

        for(let i=1; i <= total; i++){ 

            const conditionalAttr = {};

            if(this.state.rate === i) {
                conditionalAttr.defaultChecked  = true;
            }

            items.push(
            <li key={i}  className={`${ i <= this.state.rate ? style.active : '' } ${ i <= this.state.rateHover ? style.hover : '' }`}  onMouseEnter={()=> this.handleMouseEnter(i) } onMouseLeave={this.handleMouseLeave }>
                <input  {...conditionalAttr}  type="radio" id={`star${i}`} name="rate" value={i} onChange={ this.handleChange } />
                <label htmlFor={`star${i}`}><span className="sr_only">{i}점</span></label>
            </li>
            )
        }

        return ( 
            <ul className={style.container}>
                {items}
            </ul>
        );
    }
}
