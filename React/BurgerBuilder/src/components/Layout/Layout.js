import React from 'react';
import Auxiliary from '../../hoc/Auxiliary';
import './Layout.css';

const layout = props => (
    <Auxiliary>
        <div>Toolbar, SideDrawer, Backdrop</div>
        <main className="Content">
            {props.children}
        </main>
    </Auxiliary>
);

export default layout;