import React from 'react' ;

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(
  theme => ({
    empty: {
      textAlign: 'center',
      margin: '3em 0',
      color: '#999',
    },
  })
);

export default function NoContent ( props ) {

  const classes = useStyles(props) ;

  const { children , ...extra } = props ;

  return (
    <Typography className={classes.empty} variant="h3" {...extra}>{children}</Typography>
  ) ;

}
