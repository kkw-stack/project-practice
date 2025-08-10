import React, { Component } from 'react';

import debounce from './utils/debounce';

import style from './ScrollTop.module.css';

export default class ScrollTop extends Component {

    constructor(props){
        super(props);
        this.state = {
            isBottom : false
        }

        this.debouceHandleScroll = debounce(this.handleScroll,200);
    }

    // Callback
    componentDidMount() {
        window.addEventListener('scroll', this.debouceHandleScroll);
    }
    
    componentWillUnmount() {
        window.removeEventListener('scroll', this.debouceHandleScroll);
    }
    
    // Event Handeler
    handleScroll = () => {
        if ( window.scrollY + window.innerHeight >= document.body.scrollHeight && document.body.scrollHeight >= (window.innerHeight * 1.5)  ) {
            this.setState({
                isBottom: true,
            });
        }else{
            if(this.state.isBottom){
                this.setState({
                    isBottom: false,
                });
            }
        }
    }

    handleClick = () => {
        window.scrollTo(0,0);
    }

    // Renderer
    render() { 
        return ( 
            <button type="button" className={`${style.container} ${this.state.isBottom ? style.show : '' }`} onClick={this.handleClick}>
                <span>TOP</span>
            </button>
        );
    }
}
