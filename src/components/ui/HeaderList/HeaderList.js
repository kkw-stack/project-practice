import React, { Component } from 'react';

import style from './HeaderList.module.css';

export default class HeaderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltip_open : false
        }
    }

    toogleTooltip = () => {
        this.setState({
            tooltip_open : !this.state.tooltip_open
        })
    }

    render() { 
        return ( 
            <div className={style.container}>
                <span className={style.title}>{this.props.title}</span>
                {this.props.tooltip && 
                    <div className={`${style.tooltip} ${this.state.tooltip_open ? style.open : ''}`}>
                        <button type="button" className={style.tooltip_open_btn} onClick={this.toogleTooltip}>
                            <span>
                                <i className="sr_only">가이드</i>
                            </span>
                        </button>
                        <div className={style.tooltip_content}>
                            <span className={style.tooltip_desc}>{this.props.tooltip}</span>
                            <button type="button" className={style.tooltip_close} onClick={this.toogleTooltip}>
                                <span>
                                    <i className="sr_only">툴팁 닫기</i>
                                </span>
                            </button>
                        </div>
                    </div>
                }
            </div>
         );
    }
}
 
