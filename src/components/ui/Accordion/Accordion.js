import React, { Component } from 'react';

import style from './Accordion.module.css';

export default class Accordion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive : true
        }
    }

    toggle() {
        this.setState({
            isActive : !this.state.isActive
        })
    }

    componentDidMount(){
        if( this.props.closed ){
            this.setState({
                isActive: false
            })
        }
    }

    render() {
         return (
            <div className={`${style.item} ${this.state.isActive ? style.active : style.close } `}>
                { this.props.children.map( ( child , idx ) => {
                    if ( child.props.type === 'title' ) {
                        return (
                            <div key={idx} className={style.title} onClick={() => this.toggle()}>
                                <div className={style.inner}>
                                    {child.props.children}
                                </div>
                                <div className={style.control}><i className="sr_only">펼치기/접기</i></div>
                            </div>
                        );
                    } else if ( child.props.type === 'content' && this.state.isActive ) {
                        return (
                            <div key={idx} className={style.content}>
                                {child.props.children}
                            </div>
                        );
                    }
                })}
            </div>
         )
    }
}

Accordion.Item = ( () => <></> );