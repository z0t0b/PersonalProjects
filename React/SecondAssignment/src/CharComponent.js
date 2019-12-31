import React from 'react';

export default function CharComponent({letter, clickEvent}) {
	return(
		<div style={{display: 'inline-block', padding: '10px', textAlign: 'center', margin: '10px', border: '1px solid black'}}>
			<p onClick={clickEvent}>{letter}</p>
		</div>
	);
}