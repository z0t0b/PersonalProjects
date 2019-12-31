import React from 'react';

export default function UserInput({onChange}) {
	return(
		<div style={{textAlign: 'center'}}>
			<input onChange={onChange} />
		</div>
	);
}