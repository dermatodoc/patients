import { Meteor } from 'meteor/meteor' ;

import { Documents } from '../api/documents.js' ;

export default function insertDocument ( history, format, fd ) {
  console.debug('insert-document', format, fd);
  const reader = new FileReader();
  reader.onload = function (event) {
    const buffer = event.target.result;
    Meteor.subscribe('documents', {
      onReady: () => {
        const op = {
          format,
          buffer,
        } ;
        Meteor.call('documents.insert', op , (err, result) => {
          if ( err ) console.error(err) ;
          else {
            console.debug(result);
            if ( history && history.location.pathname !== '/documents') {
              history.push({pathname: '/documents'}) ;
            }
          }
        });
      } ,
      onStop: err => console.error(err) ,
    });
  };
  //const encoding = '???' ; // We cannot guess that before we read...
  //reader.readAsText(fd, encoding);
  reader.readAsArrayBuffer(fd)
}
