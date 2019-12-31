import React from 'react';

export default function ValidationComponent({textLength}) {
	return(
		<p>{textLength < 5 ? 'Text too short' : 'Text long enough'}</p>
	);
}