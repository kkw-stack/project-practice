import React from 'react';
import Link from 'next/link';

import style from './LinksCloud.module.css';


export default function LinksCloud(props) {

    // Props
    const { data, num } = props;
 
    // State
    const [ itemNum, setItemNum ] = React.useState( num || 8);
 
    // Local var
    const itemPerPaged = 10;

    // Events
    const handleLoadMore = () => {
        // Display all item
        setItemNum(itemNum + itemPerPaged);
    } 

    // Build list items (for loop instead of map in order to use break )
    const listItems = [];
    for (let i = 0; i < data?.length; i++) {

        if(i === itemNum ) break;

        const item = data[i];
        const target = item?.link?.target === true ? '_blank' : '';
        listItems.push(<li key={i} className={style.item}><a href={item?.link?.url} className={style.link} target={target} >{item?.title}</a></li>);

    }

    // Render [TODO : convert LinkList component]
    return (
        <>
            <ul className={ style.list}>
               { listItems }
            </ul>
            {(itemNum  < data?.length) && (
            <button className={ style.more} onClick={handleLoadMore}>
                <span>
                    더 보기 
                    <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
                        <path d="M1.5 1L5.55063 5L9.5 1" stroke="#AAAAAA" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>
            )}
        </>
    );

}
