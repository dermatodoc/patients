import deburr from 'lodash.deburr';

const normalized = string => {
  string = string.toLowerCase();
  string = string.trim();
  string = string.replace(/\s/g, ' ');
  string = deburr(string);
  return string ;
} ;

export {
  normalized ,
} ;