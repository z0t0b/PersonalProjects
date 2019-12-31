import React from 'react';

export default function UserOutput({username, firstOutput, secondOutput}) {
	return(
		<div style={{textAlign: 'center'}}>
			<h1 style={{fontSize: 80, color: 'red'}}>{username}</h1>
			<p style={{fontSize: 14, color: 'blue'}}>{firstOutput}</p>
			<p style={{fontSize: 12, color: 'green'}}>{secondOutput}</p>
		</div>
	);
}