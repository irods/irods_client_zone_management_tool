import React from 'react';
import { fade, withStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import { TransitionComponent } from './transition-component';

export const StyledTreeItem = withStyles((theme) => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
}))((props) => <TreeItem draggable={props.draggable} {...props} TransitionComponent={TransitionComponent} />);