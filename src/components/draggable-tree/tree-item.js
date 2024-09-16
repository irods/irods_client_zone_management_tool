import React from 'react';
import { withStyles } from '@mui/styles';
import { TreeItem } from '@mui/x-tree-view';
import { TransitionComponent } from './transition-component';

const fade = require('fade');

export const StyledTreeItem = withStyles((theme) => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        borderLeft: `1px dashed ${ fade(theme.palette.text.primary, 0.4) }`,
    },
}))((props) => <TreeItem draggable={props.draggable} {...props} TransitionComponent={TransitionComponent}>{props.children}</TreeItem>);